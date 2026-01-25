/**
 * Global Game Configuration
 * Central source of truth for contract addresses and game settings.
 */
const GameConfig = {
    // The deployed Leaderboard Contract Address
    LEADERBOARD_CONTRACT_ADDRESS: "0x2e50E3beEd076d6F72Bf79d05032FE4Af1A2729f",

    // Default Game Cost (Visual only, contract enforces actual cost)
    GAME_COST_DOGE: "1.0",

    // Chain Information
    DOGECHAIN_ID: '0x7D0', // 2000
    RPC_URL: 'https://rpc.dogechain.dog',

    // Network Configuration for MetaMask
    DOGECHAIN_CONFIG: {
        chainId: '0x7D0',
        chainName: 'Dogechain Mainnet',
        nativeCurrency: {
            name: 'DOGE',
            symbol: 'DOGE',
            decimals: 18,
        },
        rpcUrls: ['https://rpc.dogechain.dog'],
        blockExplorerUrls: ['https://explorer.dogechain.dog/'],
    }
};

// Expose for debugging
window.GameConfig = GameConfig;
