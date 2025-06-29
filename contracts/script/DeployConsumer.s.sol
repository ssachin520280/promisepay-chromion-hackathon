// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Consumer.sol";
import "../src/EscrowFactory.sol";

contract DeployConsumer is Script {
    function run() external {
        address escrowFactoryAddress = 0xDe8080f7D36C42aE2FfDd60b65a52D49872A960c;
        
        vm.startBroadcast();

        Consumer consumer = new Consumer(escrowFactoryAddress);
        
        console.log("Consumer deployed at:", address(consumer));
        console.log("EscrowFactory address:", escrowFactoryAddress);

        vm.stopBroadcast();
    }
} 