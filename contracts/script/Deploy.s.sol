// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Script.sol";
import "../src/PledgeLogger.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        PledgeLogger logger = new PledgeLogger();

        console.log("Contract deployed at:", address(logger));

        vm.stopBroadcast();
    }
}