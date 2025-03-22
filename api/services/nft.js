import { ethers } from "ethers";
import chalk from "chalk";
import { ABI } from "../../config/ABI.js";
import { createContract } from "../core/blockchain.js";
import { log } from "../utils/helpers.js";

export const getConfigWithFallback = async (contract) => {
  let config;
  try {
    config = await contract.getConfig();
    return { config, variant: "twoParams" };
  } catch (err) {}

  let fallbackConfig;
  const fallbackIds = [0, 1, 2, 3];
  for (let id of fallbackIds) {
    try {
      fallbackConfig = await contract["getConfig(uint256)"](id);
      return { config: fallbackConfig, variant: "fourParams" };
    } catch (err) {}
  }

  if (fallbackConfig) {
    return { config: fallbackConfig, variant: "fourParams" };
  } else {
    throw new Error("Unable to retrieve configuration");
  }
};

const validateContractAddress = (address) => {
  if (!ethers.utils.isAddress(address)) {
    throw new Error('合约地址格式无效');
  }
};

export const getCollectionInfo = async (address, provider) => {
  validateContractAddress(address);
  try {
    const nameABI = ["function name() view returns (string)"];
    const symbolABI = ["function symbol() view returns (string)"];
    const nameContract = new ethers.Contract(address, nameABI, provider);
    const symbolContract = new ethers.Contract(address, symbolABI, provider);

    let name = "Unknown";
    let symbol = "Unknown";

    try {
      name = await nameContract.name();
    } catch (err) {}

    try {
      symbol = await symbolContract.symbol();
    } catch (err) {}

    return { name, symbol };
  } catch (error) {
    return { name: "Unknown", symbol: "Unknown" };
  }
};

const checkMintConditions = async (contract) => {
  try {
    const config = await contract.getConfig();
    const currentTime = Math.floor(Date.now() / 1000);
    
    // 检查公开铸造阶段
    const publicStage = config.publicStage;
    log.info("公开铸造阶段信息:");
    log.info(`- 开始时间: ${new Date(publicStage.startTime.toNumber() * 1000).toLocaleString()}`);
    log.info(`- 结束时间: ${new Date(publicStage.endTime.toNumber() * 1000).toLocaleString()}`);
    log.info(`- 铸造价格: ${ethers.utils.formatEther(publicStage.price)} MON`);
    
    if (currentTime < publicStage.startTime.toNumber()) {
      throw new Error(`公开铸造还未开始，将在 ${new Date(publicStage.startTime.toNumber() * 1000).toLocaleString()} 开始`);
    }
    
    if (currentTime > publicStage.endTime.toNumber()) {
      throw new Error('公开铸造已结束');
    }

    // 检查总供应量
    if (config.maxSupply) {
      const totalSupply = await contract.totalSupply().catch(() => null);
      if (totalSupply !== null) {
        log.info(`供应量: ${totalSupply}/${config.maxSupply}`);
        if (totalSupply.gte(config.maxSupply)) {
          throw new Error('已达到最大供应量');
        }
      }
    }

    // 检查每个钱包的限制
    if (config.walletLimit) {
      log.info(`每个钱包限制: ${config.walletLimit} 个`);
    }

    return true;
  } catch (error) {
    log.error("检查铸造条件时出错:", error.message);
    return false;
  }
};

export const executeMint = async (
  contractAddress,
  wallet,
  gasLimit,
  maxFeePerGas,
  mintVariant,
  mintPrice,
  explorerUrl,
  maxPriorityFeePerGas
) => {
  const contractWithWallet = createContract(contractAddress, ABI, wallet);
  log.info(`钱包 ${wallet.address} 正在铸造 1 个 NFT (使用 ${mintVariant} 方式)`);

  try {
    let tx;
    const txOptions = {
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
      value: mintPrice,
    };

    log.info(`交易参数: Gas限制=${gasLimit}, 最大费用=${ethers.utils.formatUnits(maxFeePerGas, 'gwei')}gwei, 优先费用=${ethers.utils.formatUnits(maxPriorityFeePerGas, 'gwei')}gwei, 价格=${ethers.utils.formatEther(mintPrice)}MON`);

    try {
      // 优先尝试 fourParams 方式
      if (mintVariant === "fourParams") {
        tx = await contractWithWallet[
          "mintPublic(address,uint256,uint256,bytes)"
        ](wallet.address, 0, 1, "0x", txOptions);
      } else {
        tx = await contractWithWallet["mintPublic(address,uint256)"](
          wallet.address,
          1,
          txOptions
        );
      }

      log.success(
        `铸造交易已发送! [${tx.hash.substring(0, 6)}...${tx.hash.substring(
          tx.hash.length - 4
        )}]`
      );
      log.dim(explorerUrl + tx.hash);

      const receipt = await tx.wait();
      
      if (receipt.status === 0) {
        throw new Error('交易执行失败，可能是合约条件不满足');
      }
      
      log.success(`交易已在区块 [${receipt.blockNumber}] 中确认`);
      log.info(`实际使用的 Gas: ${receipt.gasUsed.toString()}`);
      
      return { 
        tx, 
        successVariant: mintVariant,
        status: receipt.status,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice,
        txHash: tx.hash
      };
    } catch (err) {
      // 如果 fourParams 失败，尝试 twoParams
      if (mintVariant === "fourParams" && err.code === ethers.errors.CALL_EXCEPTION) {
        log.warning("fourParams 方式失败，尝试 twoParams 方式");
        tx = await contractWithWallet["mintPublic(address,uint256)"](
          wallet.address,
          1,
          txOptions
        );
        
        const receipt = await tx.wait();
        return { 
          tx, 
          successVariant: "twoParams",
          status: receipt.status,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          effectiveGasPrice: receipt.effectiveGasPrice,
          txHash: tx.hash
        };
      }
      throw err;
    }
  } catch (err) {
    if (err.code === ethers.errors.CALL_EXCEPTION) {
      log.error("调用异常错误 - 可能是铸造条件不满足");
      if (err.error && err.error.message) {
        log.error("错误详情:", err.error.message);
      }
    } else if (err.message.includes("INSUFFICIENT_FUNDS")) {
      log.error("余额不足");
    } else {
      log.error(`错误: ${err.message}`);
      if (err.error) {
        log.error("详细错误:", err.error);
      }
    }
    return { error: err.message, transaction: err.transaction };
  }
};

export default {
  getConfigWithFallback,
  getCollectionInfo,
  executeMint,
};