const maxHabits = 8;
let habitData = [];
let totalDaysInMonth = 0;
let habitChart;

function initializeHabitData(daysInMonth) {
    totalDaysInMonth = daysInMonth;
    habitData = new Array(totalDaysInMonth).fill(1);
}

function addHabitRow(habitName, daysInMonth, checkboxStatuses = []) {
    if (habitName.trim() === "") return;

    const row = document.createElement('tr');
    const habitNameCell = document.createElement('td');
    const removeButton = document.createElement('i');
    removeButton.className = 'fas fa-trash-alt';
    removeButton.style.cursor = 'pointer';
    removeButton.style.marginRight = '10px';

    removeButton.addEventListener('click', function() {
        row.remove();

        for (let i = 0; i < habitData.length; i++) {
            habitData[i] = calculateDayCompletion(i);
        }
        updateChartData();

        const addButton = document.querySelector('.add-habit-btn');
        if (countNonEmptyHabits() < maxHabits) {
            addButton.disabled = false;
            addButton.innerText = "Add New Habit";
        }
    });

    habitNameCell.appendChild(removeButton);

    const habitNameSpan = document.createElement('span');
    habitNameSpan.innerText = habitName;
    habitNameCell.appendChild(habitNameSpan);

    const editButton = document.createElement('i');
    editButton.className = 'fas fa-edit';
    editButton.style.cursor = 'pointer';
    editButton.style.marginLeft = '10px';
    editButton.addEventListener('click', function() {
        const newHabitName = prompt('Edit habit name:', habitNameSpan.innerText);
        if (newHabitName) {
            habitNameSpan.innerText = newHabitName;
        }
    });
    habitNameCell.appendChild(editButton);
    row.appendChild(habitNameCell);

    const checkboxes = [];
    for (let i = 0; i < daysInMonth; i++) {
        const dayCell = document.createElement('td');
        const checkboxLabel = document.createElement('label');
        checkboxLabel.classList.add('custom-checkbox');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        if (checkboxStatuses.length > 0 && checkboxStatuses[i] === 1) {
            checkbox.checked = true;
        }
        const checkmark = document.createElement('span');
        checkmark.classList.add('checkmark');
        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(checkmark);
        dayCell.appendChild(checkboxLabel);
        checkboxes.push(checkbox);
        checkbox.addEventListener('change', function() {
            updateStats();
            habitData[i] = calculateDayCompletion(i);
            updateChartData();
        });
        row.appendChild(dayCell);
    }

    const daysCompleteCell = document.createElement('td');
    const longestStreakCell = document.createElement('td');
    row.appendChild(daysCompleteCell);
    row.appendChild(longestStreakCell);

    function updateStats() {
        let daysComplete = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                daysComplete++;
                tempStreak++;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 0;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        daysCompleteCell.innerText = daysComplete;
        longestStreakCell.innerText = longestStreak;
    }

    updateStats();
    habitTable.insertBefore(row, addRow);
}

function calculateDayCompletion(dayIndex) {
    let totalChecked = 0;
    document.querySelectorAll('.habit-table tr').forEach((row) => {
        const checkbox = row.querySelectorAll('input[type="checkbox"]')[dayIndex];
        if (checkbox && checkbox.checked) {
            totalChecked++;
        }
    });
    return totalChecked;
}

function updateChartDataFromDiv() {
    const dailyCheckCountsString = document.getElementById('dailyCheckCountsDiv').innerText;

    const dailyCheckCounts = dailyCheckCountsString.split('').map(num => parseInt(num));

    habitChart.data.datasets[0].data = dailyCheckCounts;

    habitChart.options.scales.y.max = Math.max(8, Math.max(...dailyCheckCounts));

    habitChart.update();
}

let addRow;
document.addEventListener('DOMContentLoaded', async function() {
    const monthYearElement = document.getElementById('monthYear');
    const habitTable = document.getElementById('habitTable');
    const currentYear = 2024;
    const currentMonth = 9;
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthYearElement.innerText = `${monthNames[currentMonth]} ${currentYear}`;

    generateHabitTable(currentMonth, currentYear);
    initializeHabitData(new Date(currentYear, currentMonth + 1, 0).getDate());

    const habitChartCtx = document.getElementById('habitChart').getContext('2d');
    habitChart = new Chart(habitChartCtx, {
        type: 'line',
        data: {
            labels: Array.from({
                length: totalDaysInMonth
            }, (_, i) => (i + 1).toString()),
            datasets: [{
                label: 'Habits Completed',
                data: habitData,
                borderColor: '#4CAF50',
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 8,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    await loadSavedData();

    updateChartDataFromDiv();

    function generateHabitTable(month, year) {
        habitTable.innerHTML = "";
        totalDaysInMonth = new Date(year, month + 1, 0).getDate();

        const firstDay = new Date(year, month, 1).getDay();
        const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const headerRow = document.createElement('tr');
        const habitHeader = document.createElement('th');
        habitHeader.innerText = 'Habits/Day';
        headerRow.appendChild(habitHeader);
        for (let i = 0; i < totalDaysInMonth; i++) {
            const dayHeader = document.createElement('th');
            const dayOfWeek = (firstDay + i) % 7;
            dayHeader.innerHTML = `${i + 1}<br>${weekdays[dayOfWeek]}`;
            headerRow.appendChild(dayHeader);
        }
        headerRow.innerHTML += `
                <th>Days Complete</th>
                <th>Longest Streak</th>
            `;
        habitTable.appendChild(headerRow);
        addAddNewHabitRow();
    }

    function addAddNewHabitRow() {
        addRow = document.createElement('tr');
        const buttonCell = document.createElement('td');
        buttonCell.setAttribute('colspan', '8');
        const addButton = document.createElement('button');
        addButton.innerText = "Add New Habit";
        addButton.className = 'add-habit-btn';

        if (countNonEmptyHabits() >= maxHabits) {
            addButton.disabled = true;
            addButton.innerText = "Habit Limit Reached";
        }

        addButton.addEventListener('click', function() {
            if (countNonEmptyHabits() < maxHabits) {
                addHabitRow(`Habit ${countNonEmptyHabits() + 1}`, new Date(currentYear, currentMonth + 1, 0).getDate(), []);
                updateChartData();

                if (countNonEmptyHabits() >= maxHabits) {
                    addButton.disabled = true;
                    addButton.innerText = "Habit Limit Reached";
                }
            }
        });

        buttonCell.appendChild(addButton);
        addRow.appendChild(buttonCell);
        habitTable.appendChild(addRow);
    }

    function countNonEmptyHabits() {
        let nonEmptyHabitCount = 0;
        document.querySelectorAll('.habit-table tr').forEach((row) => {
            const habitNameCell = row.querySelector('td span');
            if (habitNameCell && habitNameCell.innerText.trim() !== "") {
                nonEmptyHabitCount++;
            }
        });
        return nonEmptyHabitCount;
    }

});
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
            } else {
                blackScreen.style.display = 'flex';
                mainContent.style.display = 'none';
                alert('Please switch to the BitTorrent Mainnet Chain.');
            }
        });
    }
});
document.addEventListener('DOMContentLoaded', async function() {
    const saveButton = document.getElementById('saveButton');
    const habitTable = document.getElementById('habitTable');
    const contractAddress = '0x24654CeBDD6570fa1246C2a6eFaA9129006A83C3';
    const contractABI = [{
        "inputs": [{
            "internalType": "string[20]",
            "name": "_habitNames",
            "type": "string[20]"
        }, {
            "internalType": "uint8[31][20]",
            "name": "_checkboxes",
            "type": "uint8[31][20]"
        }],
        "name": "saveHabits",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [{
            "internalType": "address",
            "name": "user",
            "type": "address"
        }],
        "name": "getHabits",
        "outputs": [{
            "components": [{
                "internalType": "string",
                "name": "habitName",
                "type": "string"
            }, {
                "internalType": "uint8[31]",
                "name": "checkboxStatus",
                "type": "uint8[31]"
            }],
            "internalType": "struct HabitTracker.HabitData[20]",
            "name": "",
            "type": "tuple[20]"
        }],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{
            "internalType": "address",
            "name": "",
            "type": "address"
        }, {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "name": "userHabits",
        "outputs": [{
            "internalType": "string",
            "name": "habitName",
            "type": "string"
        }],
        "stateMutability": "view",
        "type": "function"
    }];

    let provider, signer, contract;
    async function initializeEthers() {
        if (window.ethereum) {
            try {
                provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                signer = provider.getSigner();
                contract = new ethers.Contract(contractAddress, contractABI, signer);
                await loadSavedData();
            } catch (error) {
                console.error('Error initializing ethers or contract:', error);
                alert('Failed to initialize MetaMask or contract.');
            }
        } else {
            alert('MetaMask is not installed. Please install MetaMask to continue.');
        }
    }

    function updateChartDataFromDiv() {
        const dailyCheckCountsString = document.getElementById('dailyCheckCountsDiv').innerText;

        const dailyCheckCounts = dailyCheckCountsString.split('').map(num => parseInt(num));

        habitChart.data.datasets[0].data = dailyCheckCounts;

        habitChart.options.scales.y.max = Math.max(8, Math.max(...dailyCheckCounts));

        habitChart.update();
    }

    async function loadSavedData() {
        try {
            const userAddress = await signer.getAddress();
            const savedHabits = await contract.getHabits(userAddress);

            let dailyCheckCounts = new Array(totalDaysInMonth).fill(0);

            savedHabits.forEach((habit, index) => {
                if (index >= maxHabits) return;
                const checkboxStatuses = habit.checkboxStatus;

                addHabitRow(habit.habitName, totalDaysInMonth, checkboxStatuses);

                checkboxStatuses.forEach((status, dayIndex) => {
                    if (status === 1) {
                        dailyCheckCounts[dayIndex] += 1;
                    }
                });
            });

            let dailyCheckCountsString = dailyCheckCounts.map(count => count.toString()).join('');
            document.getElementById('dailyCheckCountsDiv').innerText = dailyCheckCountsString;

            updateChartDataFromDiv();

        } catch (error) {
            console.error('Error loading saved habits:', error);
        }
    }

    async function saveHabits() {
        if (!contract || !contract.saveHabits) {
            alert('Contract is not initialized properly.');
            return;
        }
        let habitNames = [];
        let checkboxData = [];
        document.querySelectorAll('.habit-table tr').forEach((row, index) => {
            const habitNameCell = row.querySelector('td span');
            if (habitNameCell) {
                const habitName = habitNameCell.innerText;
                habitNames.push(habitName);
                const checkboxes = Array.from(row.querySelectorAll('input[type="checkbox"]')).map(checkbox => checkbox.checked ? 1 : 0);
                while (checkboxes.length < 31) {
                    checkboxes.push(0);
                }
                checkboxData.push(checkboxes);
            }
        });
        while (habitNames.length < 20) {
            habitNames.push("");
        }
        while (checkboxData.length < 20) {
            checkboxData.push(new Array(31).fill(0));
        }
        try {
            console.log('Saving habits to the blockchain:', habitNames, checkboxData);
            const tx = await contract.saveHabits(habitNames, checkboxData);
            await tx.wait();
            alert('Habits saved to blockchain!');
        } catch (error) {
            console.error('Error saving habits:', error);
            alert('Failed to save habits to the blockchain.');
        }
    }
    initializeEthers();
    saveButton.addEventListener('click', saveHabits);
});