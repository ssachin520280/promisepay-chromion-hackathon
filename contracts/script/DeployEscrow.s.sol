// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/EscrowFactory.sol";

contract DeployEscrowFactory is Script {
    address aiAgent = 0x80e71dB45e3F250E060bF991238fc633b52AF39a;
    address consumerContract = 0x1234567890123456789012345678901234567890; // Replace with actual consumer contract address

    function run() external {
        vm.startBroadcast();

        EscrowFactory escrow = new EscrowFactory(aiAgent, consumerContract);

        console.log("EscrowFactory deployed at:", address(escrow));
        // TODO: need to also update the consumer address

        vm.stopBroadcast();
    }
}
