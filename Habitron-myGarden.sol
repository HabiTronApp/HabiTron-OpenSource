// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HabiTronGarden {
    
    struct GardenState {
        uint8[20] plotStages; // Stores the growth stage of each plot (0 means empty)
        uint8[20] plotTypes;  // Stores the type of plant (0 = empty, 1 = Tomato, 2 = Sunflower)
        uint256 coins;        // Stores the user's current coin count
    }

    mapping(address => GardenState) public gardens; // Mapping of each user's garden state

    // Function to save the garden state (plot stages, plot types, and coin count)
    function saveGarden(uint8[20] memory _plotStages, uint8[20] memory _plotTypes, uint256 _coins) public {
        GardenState storage garden = gardens[msg.sender];
        garden.plotStages = _plotStages;
        garden.plotTypes = _plotTypes;
        garden.coins = _coins;
    }

    // Function to get the garden state for the current user
    function getGarden() public view returns (uint8[20] memory, uint8[20] memory, uint256) {
        GardenState memory garden = gardens[msg.sender];
        return (garden.plotStages, garden.plotTypes, garden.coins);
    }

    // Function to allow the user to claim 1 coin
    function claimCoin() public {
        GardenState storage garden = gardens[msg.sender];
        garden.coins += 1;  // Add 1 coin to the user's coin count
    }
}
