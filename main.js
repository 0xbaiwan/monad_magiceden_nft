import inquirer from 'inquirer';
import chalk from 'chalk';
import { ethers } from 'ethers';
import { createProvider, createWallet, getRandomGasLimit, getTransactionExplorerUrl } from './api/core/blockchain.js';
import { loadWallets, ENV } from './config/env.chain.js';
import { executeMint, getCollectionInfo, getConfigWithFallback } from './api/services/nft.js';
import { log } from './api/utils/helpers.js';
import { ABI } from './config/ABI.js';
import pLimit from 'p-limit';

// ... rest of the main.js content ...