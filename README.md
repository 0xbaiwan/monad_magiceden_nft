# Monad NFT 铸造工具

一个模块化的命令行工具，用于在 Monad 区块链上铸造 NFT。通过自动检测正确的铸造函数和参数，简化了与 NFT 合约交互的过程。

## 功能特点

- **多种铸造方式**: 
  - 顺序铸造：逐个钱包按顺序铸造
  - 并行铸造：多个钱包同时铸造，提高效率
- **铸造时机选择**:
  - 即时铸造：立即执行铸造操作
  - 监控模式：持续监控合约状态，自动检测并执行铸造
  - 定时铸造：在指定时间自动开始铸造
- **智能合约集成**: 
  - 自动检测正确的铸造函数和参数
  - 支持 fourParams 和 twoParams 两种铸造方式
  - 自动重试机制，提高铸造成功率
- **自动价格检测**: 自动从合约获取铸造价格
- **多钱包支持**: 支持配置多个钱包同时铸造
- **动态 Gas 优化**: 
  - 实时获取网络 Gas 价格
  - 智能调整 Gas 参数，提高铸造成功率
  - 基于 Base Fee 的动态优先费用计算
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

## 铸造模式说明

### 1. 铸造方式选择

1. **顺序铸造**
   - 逐个钱包按顺序铸造
   - 每个钱包完成后再进行下一个
   - 特点：
     - 更稳定可控
     - 便于观察每个钱包的铸造状态
     - 出错时容易定位问题
   - 适合场景：
     - 网络拥堵时期
     - 对稳定性要求高的情况
     - 钱包数量较少时

2. **并行铸造**
   - 多个钱包同时铸造
   - 可配置并发数量（建议3-5个）
   - 特点：
     - 更高的铸造效率
     - 实时显示所有钱包的铸造进度
     - 自动统计成功和失败数量
     - 智能错误处理和重试机制
   - 使用建议：
     - 首次使用时从小并发数量开始
     - 根据网络状况调整并发数
     - 确保每个钱包有足够余额
     - 关注错误信息及时调整策略

### 2. 铸造时机选择

1. **即时铸造**
   - 立即开始铸造操作
   - 适合已经开始的铸造活动
   - 无需等待，直接执行

2. **监控铸造**
   - 持续监控合约状态
   - 自动检测铸造是否开始
   - 在铸造开始时立即执行
   - 适合不确定具体开始时间的铸造活动
   - 可设置监控间隔时间（默认3秒）

3. **定时铸造**
   - 在指定时间自动开始铸造
   - 程序会等待直到指定时间
   - 适合知道确切开始时间的铸造活动

### Gas 参数说明

1. **Gas Limit**
   - 建议设置为 110000
   - 不能低于 100000

2. **Gas Price**
   - 动态获取当前网络 Base Fee
   - 建议设置为当前 Base Fee 的 2 倍
   - 程序会显示实时建议值

3. **优先费用 (Priority Fee)**
   - 基于当前 Base Fee 的百分比计算
   - 默认为 Base Fee 的 10%
   - 可自定义百分比（1-100%）
   - 建议设置：
     - 网络空闲：10-20%
     - 网络繁忙：20-40%
     - 网络拥堵：40% 以上
   - 百分比越高，交易打包优先级越高

### 使用示例

```
─────────────────────────────────
         MONAD NFT 铸造工具      
       在 Monad 链上铸造 NFT                                   
─────────────────────────────────

? 选择铸造方式: 并行铸造 - 多个钱包同时铸造
? 选择铸造时机: 即时铸造 - 立即开始铸造
? 并发铸造数量: 3
? NFT 合约地址或 Magic Eden 链接: https://magiceden.io/mint-terminal/monad-testnet/0x000000000000000
> 使用合约地址: 0x00000000000000
> 系列: MyNFTCollection (MNFT)
> 开始并行铸造，并发数量: 3
+ 钱包 1 第 1 个铸造成功！[0x0000...000]
+ 钱包 2 第 1 个铸造成功！[0x0000...001]
+ 钱包 3 第 1 个铸造成功！[0x0000...002]

铸造统计:
- 成功: 3 个
- 失败: 0 个
- 总计: 3 个
```

## 错误处理

- 智能检测合约状态和条件
- 自动切换铸造方法（fourParams/twoParams）
- 显示详细的错误信息和状态
- 并行模式下的独立错误处理
- 自动重试机制，提高成功率
- 余额不足自动跳过

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