/**
 * Global Game Configuration
 * Central source of truth for contract addresses and game settings.
 */
const GameConfig = {
    // The deployed Leaderboard Contract Address
    LEADERBOARD_CONTRACT_ADDRESS: "0xb1289Cd8E1194A40aEAaC0Ce4B477B6C60eBDF74",

    // Game Version
    GAME_VERSION: "0.85",

    // Chain Information
    DOGECHAIN_ID: '0x7D0', // 2000
    RPC_URL: 'https://rpc.dogechain.dog',

    // Network Configuration for wallet
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
