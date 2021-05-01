// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract expenseTracker {
    
    struct transaction{
        string text;
        int256 amount;
    }
    
    mapping(address => transaction[]) private transactionMap;
    mapping(address => int256) private userBalance;
    
    // constructor(){
        
    // }
    
    
    function addTransaction (string memory text, int256 val) public returns(bool){
        transactionMap[msg.sender].push(transaction(text, val));
        userBalance[msg.sender] += val ;
        return true;
    }
    
    function getBalance(address user) public view returns(int256){
        return userBalance[user];
    }
    
    function getTransactions(address user) public view returns(transaction[] memory){
        return transactionMap[user];
    }
}