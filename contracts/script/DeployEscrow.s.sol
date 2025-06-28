// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/EscrowFactory.sol";

contract DeployEscrowFactory is Script {
    address aiAgent = 0x80e71dB45e3F250E060bF991238fc633b52AF39a;

    function run() external {
        vm.startBroadcast();

        EscrowFactory escrow = new EscrowFactory(aiAgent);

        console.log("EscrowFactory deployed at:", address(escrow));

        vm.stopBroadcast();
    }
}
