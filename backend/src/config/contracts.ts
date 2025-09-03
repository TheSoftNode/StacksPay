/**
 * Deployed contract addresses for different networks
 * Updated from clarinet deployment to testnet
 */
export const CONTRACT_ADDRESSES = {
  testnet: {
    deployer: 'ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7',
    contracts: {
      'sbtc-registry': 'ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.sbtc-registry',
      'sbtc-bootstrap-signers': 'ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.sbtc-bootstrap-signers',
      'sbtc-token': 'ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.sbtc-token',
      'sbtc-deposit': 'ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.sbtc-deposit',
      'sbtc-withdrawal': 'ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.sbtc-withdrawal',
    }
  },
  mainnet: {
    deployer: '', // To be configured for mainnet deployment
    contracts: {
      'sbtc-registry': '',
      'sbtc-bootstrap-signers': '',
      'sbtc-token': '',
      'sbtc-deposit': '',
      'sbtc-withdrawal': '',
    }
  },
  devnet: {
    deployer: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contracts: {
      'sbtc-registry': 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-registry',
      'sbtc-bootstrap-signers': 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-bootstrap-signers',
      'sbtc-token': 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-token',
      'sbtc-deposit': 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-deposit',
      'sbtc-withdrawal': 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-withdrawal',
    }
  }
} as const;

/**
 * Get contract address for the current network
 */
export function getContractAddress(
  contractName: keyof typeof CONTRACT_ADDRESSES.testnet.contracts,
  network: 'testnet' | 'mainnet' | 'devnet' = 'testnet'
): string {
  const address = CONTRACT_ADDRESSES[network].contracts[contractName];
  if (!address) {
    throw new Error(`Contract ${contractName} not found for network ${network}`);
  }
  return address;
}

/**
 * Parse contract address into deployer and name
 */
export function parseContractAddress(contractAddress: string): {
  deployer: string;
  contractName: string;
} {
  const [deployer, contractName] = contractAddress.split('.');
  return { deployer, contractName };
}
