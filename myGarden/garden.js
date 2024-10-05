const contractAddress = '0xba65d9AD477077BfF9D66bb3e6eC1bB7B274ffb6';
const contractABI = [{
        "inputs": [],
        "name": "claimCoin",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{
                "internalType": "uint8[20]",
                "name": "_plotStages",
                "type": "uint8[20]"
            },
            {
                "internalType": "uint8[20]",
                "name": "_plotTypes",
                "type": "uint8[20]"
            },
            {
                "internalType": "uint256",
                "name": "_coins",
                "type": "uint256"
            }
        ],
        "name": "saveGarden",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "address",
            "name": "",
            "type": "address"
        }],
        "name": "gardens",
        "outputs": [{
            "internalType": "uint256",
            "name": "coins",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getGarden",
        "outputs": [{
                "internalType": "uint8[20]",
                "name": "",
                "type": "uint8[20]"
            },
            {
                "internalType": "uint8[20]",
                "name": "",
                "type": "uint8[20]"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

let plotState = {
    plot1: null,
    plot2: null,
    plot3: null,
    plot4: null,
    plot5: null,
    plot6: null,
    plot7: null,
    plot8: null,
    plot9: null,
    plot10: null,
    plot11: null,
    plot12: null,
    plot13: null,
    plot14: null,
    plot15: null,
    plot16: null,
    plot17: null,
    plot18: null,
    plot19: null,
    plot20: null
};

const plantOptions = {
    tomato: {
        name: "Tomato",
        stages: [
            "tomato-seed.png",
            "tomato-sprout.png",
            "tomato-small.png",
            "tomato-growing.png",
            "tomato-mature.png",
            "tomato-full.png"
        ]
    },
    sunflower: {
        name: "Sunflower",
        stages: [
            "sunflower-seed.png",
            "sunflower-sprout.png",
            "sunflower-small.png",
            "sunflower-growing.png",
            "sunflower-mature.png",
            "sunflower-full.png"
        ]
    }
};

let plotTypes = Array(20).fill(0);

let coins = 20;

document.getElementById("coinCount").textContent = coins;

function growPlant(plotId) {
    if (coins > 0) {
        let currentPlant = plotState[plotId];

        if (!currentPlant) {
            showPlantChoiceModal(plotId);
        } else {

            let currentStage = currentPlant.stage;
            if (currentStage < currentPlant.stages.length - 1) {
                currentStage++;
                currentPlant.stage = currentStage;
                document.getElementById(plotId).innerHTML = `<img src="${currentPlant.stages[currentStage]}" alt="Plant Stage">`;

                coins--;
                document.getElementById("coinCount").textContent = coins;
            } else {
                alert("The plant is fully grown!");
            }
        }
    } else {
        alert("You don't have enough coins!");
    }
}

function showPlantChoiceModal(plotId) {
    const modal = document.getElementById("plantChoiceModal");
    modal.style.display = "flex";

    document.getElementById("chooseTomato").onclick = function() {
        plantSeed(plotId, "tomato", 1);
        modal.style.display = "none";
    };

    document.getElementById("chooseSunflower").onclick = function() {
        plantSeed(plotId, "sunflower", 2);
        modal.style.display = "none";
    };
}

function plantSeed(plotId, plantType, typeCode) {
    const chosenPlant = plantOptions[plantType];
    plotState[plotId] = {
        stages: chosenPlant.stages,
        stage: 0
    };
    plotTypes[parseInt(plotId.replace('plot', '')) - 1] = typeCode;
    document.getElementById(plotId).innerHTML = `<img src="${chosenPlant.stages[0]}" alt="Seed Stage">`;
}

let checkInterval;

async function checkMetaMaskConnection() {
    if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        const chainId = network.chainId;

        if (chainId !== 199) {
            alert("Please switch to the BitTorrent Mainnet Chain!");
            return;
        }

        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        document.getElementById("walletAddress").textContent = userAddress;

        document.getElementById("gardenBackground").style.display = 'block';

        clearInterval(checkInterval);
    } else {
        alert("MetaMask is not installed. Please install MetaMask to continue.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    checkInterval = setInterval(checkMetaMaskConnection, 500);
});

async function loadGardenState() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    try {
        const [plotStages, plotTypesStored, coinsStored] = await contract.getGarden();

        for (let i = 0; i < 20; i++) {
            if (plotStages[i] !== 0) {
                const plantType = plotTypesStored[i] === 1 ? 'tomato' : 'sunflower';
                plotState[`plot${i + 1}`] = {
                    stage: plotStages[i],
                    stages: plantOptions[plantType].stages
                };
                document.getElementById(`plot${i + 1}`).innerHTML = `<img src="${plantOptions[plantType].stages[plotStages[i]]}" alt="Plant Stage">`;
            }
        }

        if (coinsStored > 0) {
            coins = coinsStored;
        } else {
            coins = 20;
        }
        document.getElementById("coinCount").textContent = coins;
    } catch (error) {
        console.error('Error loading garden state:', error);
    }
}

async function saveGardenState() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    try {

        const plotStages = Array.from({
            length: 20
        }, (_, i) => plotState[`plot${i + 1}`]?.stage || 0);
        const coins = parseInt(document.getElementById("coinCount").textContent, 10);

        const transaction = await contract.saveGarden(plotStages, plotTypes, coins);
        await transaction.wait();
        alert('Garden state saved successfully!');
    } catch (error) {
        console.error('Failed to save garden state:', error);
    }
}

async function claimCoin() {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        console.log('Attempting to claim coin...');

        const transaction = await contract.claimCoin();
        console.log('Transaction hash:', transaction.hash);

        await transaction.wait();

        console.log('Transaction confirmed.');
        alert('1 coin claimed!');

        let currentCoins = parseInt(document.getElementById("coinCount").textContent, 10);
        document.getElementById("coinCount").textContent = currentCoins + 1;

    } catch (error) {
        console.error('Error claiming coin:', error);
        alert('Error claiming coin: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', loadGardenState);

document.getElementById('saveButton').addEventListener('click', saveGardenState);
document.getElementById('claimCoinButton').addEventListener('click', claimCoin);