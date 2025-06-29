// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Consumer.sol";
import "../src/EscrowFactory.sol";

contract DeployConsumer is Script {
    function run() external {
        address escrowFactoryAddress = 0x1234567890123456789012345678901234567890; // Replace with actual consumer contract address
        
        vm.startBroadcast(deployerPrivateKey);

        Consumer consumer = new Consumer(escrowFactoryAddress);
        
        console.log("Consumer deployed at:", address(consumer));
        console.log("EscrowFactory address:", escrowFactoryAddress);

        vm.stopBroadcast();
    }
} 