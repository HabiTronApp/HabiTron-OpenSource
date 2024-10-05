document.addEventListener('DOMContentLoaded', function() {
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const blackScreen = document.getElementById('blackScreen');
    const mainContent = document.getElementById('mainContent');

    async function checkConnection() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_accounts'
                });
                const network = await window.ethereum.request({
                    method: 'net_version'
                });

                if (accounts.length > 0 && network === '199') {
                    blackScreen.style.display = 'none';
                    mainContent.style.display = 'block';

                    loadTodosFromBTTC();
                } else {
                    blackScreen.style.display = 'flex';
                    mainContent.style.display = 'none';
                }
            } catch (error) {
                console.error('Error checking MetaMask connection:', error);
            }
        } else {
            alert('MetaMask is not installed. Please install MetaMask to continue.');
        }
    }

    setInterval(checkConnection, 1000);

    connectWalletBtn.addEventListener('click', async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                checkConnection();

                loadTodosFromBTTC();
            } catch (error) {
                console.error('User denied account access', error);
            }
        } else {
            alert('MetaMask is not installed. Please install MetaMask to continue.');
        }
    });

    if (window.ethereum) {
        window.ethereum.on('chainChanged', (chainId) => {
            if (parseInt(chainId) === 199) {
                blackScreen.style.display = 'none';
                mainContent.style.display = 'block';

                loadTodosFromBTTC();
            } else {
                blackScreen.style.display = 'flex';
                mainContent.style.display = 'none';
                alert('Please switch to the BitTorrent Mainnet Chain.');
            }
        });
    }
});

async function switchToBTTCNetwork() {
    const chainId = '0xc7';
    try {
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{
                chainId
            }],
        });
    } catch (error) {
        if (error.code === 4902) {
            try {
                await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId,
                        chainName: 'BitTorrent Mainnet',
                        nativeCurrency: {
                            name: 'BTT',
                            symbol: 'BTT',
                            decimals: 18,
                        },
                        rpcUrls: ['https://rpc.bittorrentchain.io'],
                        blockExplorerUrls: ['https://bttcscan.com'],
                    }, ],
                });
            } catch (addError) {
                console.error('Failed to add BTTC network to MetaMask:', addError);
            }
        } else {
            console.error('Failed to switch to BTTC network:', error);
        }
    }
}



async function saveTodosToBTTC() {
    const contractAddress = '0xC4844D8CC315dBE51B6004191791797e9fFb6a59';
    const contractABI = [{
            "inputs": [{
                "internalType": "string",
                "name": "_todos",
                "type": "string"
            }],
            "name": "saveTodos",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getTodos",
            "outputs": [{
                "internalType": "string",
                "name": "",
                "type": "string"
            }],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        const toDoList = JSON.stringify(todoManager.todos);
        const transaction = await contract.saveTodos(toDoList);

        await transaction.wait();
        alert('Todos saved to BTTC!');
    } catch (error) {
        console.error('Failed to save todos to BTTC:', error);
    }
}

document.querySelector('.save-bttc-btn').addEventListener('click', saveTodosToBTTC);



let provider, signer, contract;

async function initializeEthers() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);
    } else {
        alert('MetaMask is not installed. Please install MetaMask to continue.');
    }
}

async function loadTodosFromBTTC() {
    const contractAddress = '0xC4844D8CC315dBE51B6004191791797e9fFb6a59';
    const contractABI = [{
            "inputs": [{
                "internalType": "string",
                "name": "_todos",
                "type": "string"
            }],
            "name": "saveTodos",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getTodos",
            "outputs": [{
                "internalType": "string",
                "name": "",
                "type": "string"
            }],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const savedTodos = await contract.getTodos();
        console.log('Todos loaded from contract:', savedTodos);
        const todosArray = JSON.parse(savedTodos);
        todoManager.todos = todosArray;
        uiManager.showAllTodos();
    } catch (error) {
        console.error('Error loading todos from BTTC:', error);
    }
}

document.querySelector('.save-bttc-btn').addEventListener('click', saveTodosToBTTC);
initializeEthers();