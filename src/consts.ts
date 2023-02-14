const ADDRESS = {
  NODE: process.env.REACT_APP_NODE_ADDRESS as string,
  IPFS_GATEWAY: process.env.REACT_APP_IPFS_GATEWAY_ADDRESS as string,
};

const LOCAL_STORAGE = {
  ACCOUNT: 'account',
  WALLET: 'wallet',
};

export { ADDRESS, LOCAL_STORAGE };
