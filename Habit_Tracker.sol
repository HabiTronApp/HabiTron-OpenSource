// SPDX-License-Identifier: MIT
pragma solidity 0.8.1;

contract HabitTracker {
    struct HabitData {
        string habitName;
        uint8[31] checkboxStatus; 
    }

    mapping(address => HabitData[20]) public userHabits; 

    function saveHabits(string[20] memory _habitNames, uint8[31][20] memory _checkboxes) public {
        require(_habitNames.length <= 20, "Maximum 20 habits allowed.");
        require(_checkboxes.length <= 20, "Maximum 20 habits allowed.");
        
        for (uint i = 0; i < _habitNames.length; i++) {
            userHabits[msg.sender][i] = HabitData(_habitNames[i], _checkboxes[i]);
        }
    }

    function getHabits(address user) public view returns (HabitData[20] memory) {
        return userHabits[user];
    }
}
