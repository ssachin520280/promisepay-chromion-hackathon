// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {Consumer} from "../src/Consumer.sol";

/**
 * @title Deploy
 * @notice Script to deploy the Consumer contract on Sepolia
 * @dev This script deploys the Consumer contract and logs the deployment address
 */
contract Deploy is Script {
    function run() external {
        // Get the private key from environment variable
        
        // Start broadcasting transactions
        vm.startBroadcast();
        
        // Deploy the Consumer contract
        Consumer consumer = new Consumer();
        
        // Stop broadcasting
        vm.stopBroadcast();

        console.log("Consumer deployed to:", address(consumer));
    }
}
