# Monad NFT 铸造工具

一个模块化的命令行工具，用于在 Monad 区块链上铸造 NFT。通过自动检测正确的铸造函数和参数，简化了与 NFT 合约交互的过程。

## 功能特点

- **多种铸造模式**: 
  - 即时铸造：立即执行铸造操作
  - 定时铸造：在指定时间自动开始铸造
  - 监控模式：持续监控合约状态，自动检测并执行铸造
- **智能合约集成**: 
  - 自动检测正确的铸造函数和参数
  - 支持 fourParams 和 twoParams 两种铸造方式
  - 自动重试机制，提高铸造成功率
- **自动价格检测**: 自动从合约获取铸造价格
- **多钱包支持**: 支持配置多个钱包同时铸造
- **动态 Gas 优化**: 
  - 实时获取网络 Gas 价格
  - 智能调整 Gas 参数，提高铸造成功率
  - 三级优先费用预设：一般、加速、极速
- **系列详情**: 显示系列名称和供应信息
- **Magic Eden 链接支持**: 直接粘贴 Magic Eden 铸造链接即可提取合约地址

## 安装说明

1. 克隆仓库:

```bash
git clone https://github.com/0xbaiwan/monad_magiceden_nft.git
cd monad_magiceden_nft
```

2. 安装依赖:

```bash
npm install
```

3. 配置钱包:

   在 `.env` 文件中添加你的私钥，支持配置多个钱包:

   ```
   NETWORK=monad-testnet
   MAX_CONCURRENT_MINTS=10
   DEFAULT_GAS_LIMIT_MIN=180000
   DEFAULT_GAS_LIMIT_MAX=280000

   # 可以配置多个钱包
   PRIVATEKEY_1=0x你的私钥1
   PRIVATEKEY_2=0x你的私钥2
   PRIVATEKEY_3=0x你的私钥3
   ```

   ⚠️ **重要提示**: 
   - 切勿分享你的 `.env` 文件或泄露你的私钥
   - 多个钱包的私钥格式为 PRIVATEKEY_1, PRIVATEKEY_2 等
   - 确保每个私钥都以 0x 开头

## 使用方法

启动铸造工具:

```bash
# 设置环境变量
npm run setup    # 这将从 env.template 创建 .env 文件

# 启动
npm start
```

### 铸造模式选择

1. **即时铸造模式**
   - 立即执行铸造操作
   - 适合已经开始的铸造活动

2. **定时铸造模式**
   - 设定特定时间自动开始铸造
   - 程序会等待直到指定时间
   - 适合知道确切开始时间的铸造活动

3. **监控模式**
   - 持续监控合约状态
   - 自动检测铸造是否开始
   - 在铸造开始时立即执行
   - 适合不确定具体开始时间的铸造活动
   - 可设置监控间隔时间（默认3秒）

### Gas 参数说明

1. **Gas Limit**
   - 建议设置为 110000
   - 不能低于 100000

2. **Gas Price**
   - 动态获取当前网络 Base Fee
   - 建议设置为当前 Base Fee 的 2 倍
   - 程序会显示实时建议值

3. **优先费用 (Priority Fee)**
   - 一般模式：6 gwei（适用于网络空闲时期）
   - 加速模式：20 gwei（适用于一般情况）
   - 极速模式：50 gwei（适用于网络拥堵时期）
   - 支持自定义设置

### 铸造方法选择

1. **自动模式（推荐）**
   - 先尝试 fourParams 方法
   - 如果失败则自动切换到 twoParams 方法
   - 避免 gas 浪费

2. **指定模式**
   - fourParams：直接使用 fourParams 方法
   - twoParams：直接使用 twoParams 方法
   - 适合已知正确铸造方法的情况

### 使用示例

```
┌─────────────────────────────────┐
│         MONAD NFT 铸造工具       │
│       在 Monad 链上铸造 NFT       │
│                                 │
└─────────────────────────────────┘

? 铸造模式: 监控模式
? NFT 合约地址或 Magic Eden 链接: https://magiceden.io/mint-terminal/monad-testnet/0x000000000000000
> 使用合约地址: 0x00000000000000
> 系列: MyNFTCollection (MNFT)
> 开始监控铸造状态...
> 监控间隔: 3 秒
+ 检测到铸造已开始！
- 铸造价格: 0.0001 MON
- 结束时间: 2024-03-15 12:00:00
> 使用钱包 1 开始铸造...
+ 铸造交易已发送! [0x0000...000]
  https://testnet.monadexplorer.com/tx/000000000
+ 交易已在区块 [6290517] 中确认
+ 铸造过程完成!
```

## 错误处理

- 如果铸造失败，程序会自动尝试不同的铸造方法
- 显示详细的错误信息和状态
- 自动重试机制，提高成功率
- 智能检测合约状态和条件

## 项目结构

```
|— api/
|   |— core/           # 核心组件
|   |— services/       # API 服务
|   |— utils/          # 辅助工具
|— config/             # 配置文件
|— main.js            # 主程序入口
```

## 支持的网络

目前支持 Monad 测试网。

## 贡献

欢迎贡献！请随时提出问题或提交拉取请求。

## 许可证

本项目采用 MIT 许可证。

