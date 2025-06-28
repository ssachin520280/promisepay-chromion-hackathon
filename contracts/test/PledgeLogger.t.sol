// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../lib/forge-std/src/Test.sol";
import "../src/PledgeLogger.sol";

contract PledgeLoggerTest is Test {
    PledgeLogger logger;

    function setUp() public {
        logger = new PledgeLogger();
    }

    function testLogContractEmitsEvent() public {
        bytes32 contractHash = keccak256(abi.encodePacked("test-contract"));
        string memory uri = "ipfs://sampleContractMetadata.json";

        vm.expectEmit(true, true, false, true);
        emit PledgeLogger.ContractLogged(address(this), contractHash, uri, block.timestamp);

        logger.logContract(contractHash, uri);
    }

    function testLogRatingEmitsEvent() public {
        bytes32 ratingHash = keccak256(abi.encodePacked("4-stars"));
        string memory context = "Excellent communication and on-time delivery";

        vm.expectEmit(true, true, false, true);
        emit PledgeLogger.RatingLogged(address(this), ratingHash, context, block.timestamp);

        logger.logRating(ratingHash, context);
    }
}