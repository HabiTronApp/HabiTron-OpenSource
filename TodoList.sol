// SPDX-License-Identifier: MIT
pragma solidity 0.8.1;

contract TodoList {
    mapping(address => string) private todos;

    // Function to save todos
    function saveTodos(string memory _todos) public {
        todos[msg.sender] = _todos;
    }

    // Function to get saved todos
    function getTodos() public view returns (string memory) {
        return todos[msg.sender];
    }
}
