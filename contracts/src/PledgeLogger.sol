// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PledgeLogger {
    event ContractLogged(
        address indexed sender,
        bytes32 indexed contractIdHash,
        string metadataURI,
        uint256 timestamp
    );

    event RatingLogged(
        address indexed sender,
        bytes32 indexed ratingHash,
        string context,
        uint256 timestamp
    );

    function logContract(bytes32 contractIdHash, string calldata metadataURI) external {
        emit ContractLogged(msg.sender, contractIdHash, metadataURI, block.timestamp);
    }

    function logRating(bytes32 ratingHash, string calldata context) external {
        emit RatingLogged(msg.sender, ratingHash, context, block.timestamp);
    }
}
