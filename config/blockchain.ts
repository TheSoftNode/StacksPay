export const blockchainConfig = {
  bitcoin: {
    network: process.env.BITCOIN_NETWORK || 'testnet',
    rpcUrl: process.env.BITCOIN_RPC_URL || 'https://bitcoin-testnet.example.com',
    rpcUsername: process.env.BITCOIN_RPC_USERNAME,
    rpcPassword: process.env.BITCOIN_RPC_PASSWORD,
  },
  stacks: {
    network: process.env.STACKS_NETWORK || 'testnet',
    apiUrl: process.env.STACKS_API_URL || 'https://stacks-node-api.testnet.stacks.co',
    contractAddress: process.env.STACKS_CONTRACT_ADDRESS,
    contractName: process.env.STACKS_CONTRACT_NAME,
  },
  sbtc: {
    bridgeContract: process.env.SBTC_BRIDGE_CONTRACT,
    minConfirmations: parseInt(process.env.SBTC_MIN_CONFIRMATIONS || '3'),
  },
};
