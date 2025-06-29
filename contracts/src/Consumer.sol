// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/chainlink-brownie-contracts/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import "../lib/chainlink-brownie-contracts/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "../lib/chainlink-brownie-contracts/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import "./EscrowFactory.sol";

/**
 * @title Consumer
 * @notice Contract to handle cancellation requests for escrow projects using Chainlink Functions
 * @dev This contract validates cancellation requests based on time constraints
 */
contract Consumer is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    // State variables
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    // EscrowFactory contract reference
    EscrowFactory public immutable escrowFactory;

    // Request tracking
    struct CancellationRequest {
        uint256 projectId;
        address eoaAddress;
        uint256 timestamp;
        bool isPending;
    }

    mapping(bytes32 => CancellationRequest) public cancellationRequests;

    // Custom errors
    error UnexpectedRequestID(bytes32 requestId);
    error InvalidProject();
    error RequestAlreadyPending();
    error CancellationNotAllowed();

    // Events
    event CancellationRequestInitiated(
        bytes32 indexed requestId,
        uint256 indexed projectId,
        address indexed eoaAddress,
        uint64 subscriptionId
    );

    event CancellationRequestFulfilled(
        bytes32 indexed requestId,
        uint256 indexed projectId,
        address indexed eoaAddress,
        bool approved,
        string response
    );

    event CancellationExecuted(
        uint256 indexed projectId,
        address indexed eoaAddress,
        bool success
    );

    // Router address - Hardcoded for Sepolia
    address router = 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;

    // JavaScript source code to validate cancellation time
    string source = 
        "const projectId = args[0];"
        "const creationTime = args[1];"
        "const currentTime = Math.floor(Date.now() / 1000);"
        "const timeDiff = currentTime - parseInt(creationTime);"
        "const minTimeRequired = 120; // 2 minutes in seconds"
        ""
        "if (timeDiff >= minTimeRequired) {"
        "  return Functions.encodeString('APPROVED');"
        "} else {"
        "  return Functions.encodeString('DENIED');"
        "}";

    // Callback gas limit
    uint32 gasLimit = 300000;

    // donID - Hardcoded for Sepolia
    bytes32 donID = 0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;

    /**
     * @notice Initializes the contract with the Chainlink router address and EscrowFactory
     * @param _escrowFactory The address of the EscrowFactory contract
     */
    constructor(address _escrowFactory) FunctionsClient(router) ConfirmedOwner(msg.sender) {
        escrowFactory = EscrowFactory(_escrowFactory);
    }

    /**
     * @notice Initiates a cancellation request for a project
     * @param projectId The ID of the project to cancel
     * @param eoaAddress The EOA address requesting cancellation
     * @param subscriptionId The Chainlink subscription ID
     * @return requestId The ID of the request
     */
    function requestCancellation(
        uint256 projectId,
        address eoaAddress,
        uint64 subscriptionId
    ) external returns (bytes32 requestId) {
        // Validate project exists
        EscrowFactory.Project memory project = escrowFactory.getProject(projectId);
        if (project.client == address(0)) {
            revert InvalidProject();
        }

        // Validate caller is either client or freelancer
        if (msg.sender != project.client && msg.sender != project.freelancer) {
            revert CancellationNotAllowed();
        }

        // Create request arguments
        string[] memory args = new string[](2);
        args[0] = uint2str(projectId);
        args[1] = uint2str(project.creationTimestamp);

        // Initialize the request
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        req.setArgs(args);

        // Send the request
        requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donID
        );

        // Store request details
        cancellationRequests[requestId] = CancellationRequest({
            projectId: projectId,
            eoaAddress: eoaAddress,
            timestamp: block.timestamp,
            isPending: true
        });

        s_lastRequestId = requestId;

        emit CancellationRequestInitiated(requestId, projectId, eoaAddress, subscriptionId);
    }

    /**
     * @notice Callback function for fulfilling a cancellation request
     * @param requestId The ID of the request to fulfill
     * @param response The response from Chainlink Functions
     * @param err Any errors from the Functions request
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId);
        }

        // Update state variables
        s_lastResponse = response;
        s_lastError = err;

        // Get request details
        CancellationRequest storage request = cancellationRequests[requestId];
        require(request.isPending, "Request not found or already processed");

        // Mark request as processed
        request.isPending = false;

        string memory responseString = string(response);
        bool approved = keccak256(bytes(responseString)) == keccak256(bytes("APPROVED"));

        emit CancellationRequestFulfilled(
            requestId,
            request.projectId,
            request.eoaAddress,
            approved,
            responseString
        );

        // If approved, execute cancellation
        if (approved) {
            try escrowFactory.cancelProject(request.projectId, request.eoaAddress) {
                emit CancellationExecuted(request.projectId, request.eoaAddress, true);
            } catch {
                emit CancellationExecuted(request.projectId, request.eoaAddress, false);
            }
        }
    }

    /**
     * @notice Helper function to convert uint to string
     * @param _i The uint to convert
     * @return The string representation
     */
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k -= 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    /**
     * @notice Get the last request details
     * @return requestId The last request ID
     * @return response The last response
     * @return error The last error
     */
    function getLastRequest() external view returns (bytes32 requestId, bytes memory response, bytes memory error) {
        return (s_lastRequestId, s_lastResponse, s_lastError);
    }

    /**
     * @notice Get cancellation request details
     * @param requestId The request ID
     * @return The cancellation request details
     */
    function getCancellationRequest(bytes32 requestId) external view returns (CancellationRequest memory) {
        return cancellationRequests[requestId];
    }
}
