export const developmentConfig = {
  database: {
    mongodb: {
      uri: 'mongodb://localhost:27017',
      dbName: 'sbtc_gateway_dev',
    },
    redis: {
      url: 'redis://localhost:6379',
    },
  },
  blockchain: {
    bitcoin: {
      network: 'regtest',
      rpcUrl: 'http://localhost:18443',
    },
    stacks: {
      network: 'devnet',
      apiUrl: 'http://localhost:3999',
    },
  },
  api: {
    baseUrl: 'http://localhost:3000',
    rateLimit: {
      max: 10000, // Higher limits for development
    },
  },
  logging: {
    level: 'debug',
    enableConsole: true,
  },
};
