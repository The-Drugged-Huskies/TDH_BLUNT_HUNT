const DOGECHAIN_ID = '0x7D0'; // 2000 in hex
const DOGECHAIN_CONFIG = {
    chainId: DOGECHAIN_ID,
    chainName: 'Dogechain Mainnet',
    nativeCurrency: {
        name: 'DOGE',
        symbol: 'DOGE', // or wDOGE
        decimals: 18,
    },
    rpcUrls: ['https://rpc.dogechain.dog'],
    blockExplorerUrls: ['https://explorer.dogechain.dog/'],
};

const connectBtn = document.getElementById('connect-wallet-btn');
const balanceDisplay = document.getElementById('balance-display');

async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask to play on Dogechain!');
        return;
    }

    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];

        // Check Network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });

        if (chainId !== DOGECHAIN_ID) {
            await switchToDogechain();
        }

        updateUI(account);

        // Listen for changes
        window.ethereum.on('accountsChanged', (accounts) => updateUI(accounts[0]));
        window.ethereum.on('chainChanged', () => window.location.reload());

    } catch (error) {
        console.error('Wallet Connection Error:', error);
    }
}

async function switchToDogechain() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: DOGECHAIN_ID }],
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [DOGECHAIN_CONFIG],
                });
            } catch (addError) {
                console.error('Error adding Dogechain:', addError);
            }
        } else {
            console.error('Error switching network:', switchError);
        }
    }
}

function updateUI(account) {
    if (account) {
        connectBtn.innerText = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
        connectBtn.classList.add('connected');
        balanceDisplay.classList.remove('hidden');
        fetchBalance(account); // Trigger balance fetch
    } else {
        connectBtn.innerText = 'Connect Wallet';
        connectBtn.classList.remove('connected');
        balanceDisplay.classList.add('hidden');
        balanceDisplay.innerText = '0.0000 DOGE';
    }
}

/**
 * fetchBalance
 * Fetches the native DOGE balance for the connected account.
 * Uses a dedicated JSON-RPC provider (Dogechain Official) to ensure accuracy
 * and independence from the user's injected wallet state.
 * 
 * @param {string} account - The wallet address to fetch balance for.
 */
async function fetchBalance(account) {
    try {
        // Use the official Dogechain RPC for reliable data
        const rpcUrl = 'https://rpc.dogechain.dog';
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
            name: 'dogechain',
            chainId: 2000
        });

        const balance = await provider.getBalance(account);
        const formattedBalance = ethers.utils.formatEther(balance);

        // Update UI with 4 decimal precision
        balanceDisplay.innerText = `${parseFloat(formattedBalance).toFixed(4)} DOGE`;
        balanceDisplay.classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching balance:', error);
        balanceDisplay.innerText = 'Error';
    }
}

connectBtn.addEventListener('click', connectWallet);

// Check if already connected on load
async function checkConnection() {
    if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId === DOGECHAIN_ID) {
                updateUI(accounts[0]);
            }
        }
    }
}

window.addEventListener('load', checkConnection);
