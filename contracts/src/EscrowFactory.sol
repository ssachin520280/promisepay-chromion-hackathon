// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

contract EscrowFactory is ReentrancyGuard {
    address public immutable aiAgent;

    constructor(address _aiAgent) {
        aiAgent = _aiAgent;
    }

    struct Project {
        address client;
        address freelancer;
        uint256 amount;
        bool aiApproved;
        bool clientApproved;
    }

    uint256 public nextProjectId;
    mapping(uint256 => Project) public projects;

    event ProjectCreated(uint256 indexed projectId, address client, address freelancer, uint256 amount);
    event ProjectSubmitted(uint256 indexed projectId);
    event ProjectApproved(uint256 indexed projectId, address approver);
    event FundsReleased(uint256 indexed projectId);
    event ProjectCancelled(uint256 indexed projectId);

    // Custom errors
    error NotClient();
    error NotAI();
    error ZeroValue();
    error InvalidProject();
    error ApprovalsMissing();
    error PaymentFailed();
    error RefundFailed();

    modifier onlyClient(uint256 projectId) {
        if (msg.sender != projects[projectId].client) {
            revert NotClient();
        }
        _;
    }

    modifier onlyAI() {
        if (msg.sender != aiAgent) {
            revert NotAI();
        }
        _;
    }

    function createProject(address freelancer) external payable {
        if (msg.value == 0) {
            revert ZeroValue();
        }

        uint256 projectId = nextProjectId++;

        projects[projectId] = Project({
            client: msg.sender,
            freelancer: freelancer,
            amount: msg.value,
            aiApproved: false,
            clientApproved: false
        });

        emit ProjectCreated(projectId, msg.sender, freelancer, msg.value);
    }

    function approveByClient(uint256 projectId) external onlyClient(projectId) {
        projects[projectId].clientApproved = true;
        emit ProjectApproved(projectId, msg.sender);
    }

    function approveByAI(uint256 projectId) external onlyAI {
        projects[projectId].aiApproved = true;
        emit ProjectApproved(projectId, msg.sender);
    }

    function releaseFunds(uint256 projectId) external nonReentrant {
        Project memory p = projects[projectId];
        if (p.amount == 0) {
            revert InvalidProject();
        }
        if (!p.clientApproved) {
            revert ApprovalsMissing();
        }

        delete projects[projectId]; // free storage before sending ETH

        (bool sent, ) = p.freelancer.call{value: p.amount}("");
        if (!sent) {
            revert PaymentFailed();
        }

        emit FundsReleased(projectId);
    }

    function cancelProject(uint256 projectId) external onlyClient(projectId) nonReentrant {
        Project memory p = projects[projectId];
        if (p.amount == 0) {
            revert InvalidProject();
        }

        delete projects[projectId];

        (bool sent, ) = p.client.call{value: p.amount}("");
        if (!sent) {
            revert RefundFailed();
        }

        emit ProjectCancelled(projectId);
    }

    // Optional: View project info
    function getProject(uint256 projectId) external view returns (Project memory) {
        return projects[projectId];
    }
}
