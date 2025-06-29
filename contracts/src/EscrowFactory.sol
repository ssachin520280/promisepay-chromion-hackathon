// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

// TODO: Add a function to update the consumer address which could only be called by the person who owns the contract
contract EscrowFactory is ReentrancyGuard {
    address public immutable aiAgent;
    address public immutable consumerContract;

    enum ProjectStatus {
        Pending,    // Contract created, waiting for freelancer to accept
        Active,     // Freelancer accepted the contract
        Submitted,  // Freelancer submitted the work
        Completed,  // Payement was released by client
        Cancelled   // Project was cancelled
    }

    struct Project {
        address client;
        address freelancer;
        uint256 amount;
        ProjectStatus status;
        string aiResponse; // Store AI's response when approving
        uint256 creationTimestamp; // Timestamp when project was created
    }

    uint256 public nextProjectId;
    mapping(uint256 => Project) public projects;

    event ProjectCreated(uint256 indexed projectId, address client, address freelancer, uint256 amount);
    event ProjectAccepted(uint256 indexed projectId, address freelancer);
    event ProjectSubmitted(uint256 indexed projectId, address freelancer);
    event ProjectApproved(uint256 indexed projectId, address approver, string aiResponse);
    event FundsReleased(uint256 indexed projectId, address freelancer, uint256 amount);
    event ProjectCancelled(uint256 indexed projectId, address cancelledBy, address refundedTo);

    // Custom errors
    error NotClient();
    error NotFreelancer();
    error NotAI();
    error NotConsumerContract();
    error ZeroValue();
    error InvalidProject();
    error InvalidStatus();
    error PaymentFailed();
    error RefundFailed();
    error UnauthorizedCancellation();

    constructor(address _aiAgent, address _consumerContract) {
        aiAgent = _aiAgent;
        consumerContract = _consumerContract;
    }

    modifier onlyClient(uint256 projectId) {
        if (msg.sender != projects[projectId].client) {
            revert NotClient();
        }
        _;
    }

    modifier onlyFreelancer(uint256 projectId) {
        if (msg.sender != projects[projectId].freelancer) {
            revert NotFreelancer();
        }
        _;
    }

    modifier onlyAI() {
        if (msg.sender != aiAgent) {
            revert NotAI();
        }
        _;
    }

    modifier onlyConsumerContract() {
        if (msg.sender != consumerContract) {
            revert NotConsumerContract();
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
            status: ProjectStatus.Pending,
            aiResponse: "",
            creationTimestamp: block.timestamp
        });

        emit ProjectCreated(projectId, msg.sender, freelancer, msg.value);
    }

    function acceptContract(uint256 projectId) external onlyFreelancer(projectId) {
        Project storage project = projects[projectId];
        if (project.status != ProjectStatus.Pending) {
            revert InvalidStatus();
        }

        project.status = ProjectStatus.Active;
        emit ProjectAccepted(projectId, msg.sender);
    }

    function submitWork(uint256 projectId) external onlyFreelancer(projectId) {
        Project storage project = projects[projectId];
        if (project.status != ProjectStatus.Active) {
            revert InvalidStatus();
        }

        project.status = ProjectStatus.Submitted;
        emit ProjectSubmitted(projectId, msg.sender);
    }

    function approveByAI(uint256 projectId, string calldata aiResponse) external onlyAI {
        Project storage project = projects[projectId];
        if (project.status != ProjectStatus.Submitted) {
            revert InvalidStatus();
        }

        project.aiResponse = aiResponse;
        emit ProjectApproved(projectId, msg.sender, aiResponse);
    }

    function releaseFunds(uint256 projectId) external onlyClient(projectId) nonReentrant {
        Project memory project = projects[projectId];
        if (project.amount == 0) {
            revert InvalidProject();
        }
        if (project.status != ProjectStatus.Active && project.status != ProjectStatus.Submitted) {
            revert InvalidStatus();
        }

        delete projects[projectId]; // free storage before sending ETH

        (bool sent, ) = project.freelancer.call{value: project.amount}("");
        if (!sent) {
            revert PaymentFailed();
        }
        project.status = ProjectStatus.Completed;


        emit FundsReleased(projectId, project.freelancer, project.amount);
    }

    function cancelProject(uint256 projectId, address eoaAddress) external onlyConsumerContract nonReentrant {
        Project memory project = projects[projectId];
        if (project.amount == 0) {
            revert InvalidProject();
        }

        // Check if the EOA is either client or freelancer
        if (eoaAddress != project.client && eoaAddress != project.freelancer) {
            revert UnauthorizedCancellation();
        }

        // Client can cancel anytime until completed
        if (eoaAddress == project.client) {
            if (project.status == ProjectStatus.Completed) {
                revert InvalidStatus();
            }
        }
        // Freelancer can only cancel when status is pending or active
        else if (eoaAddress == project.freelancer) {
            if (project.status != ProjectStatus.Pending && project.status != ProjectStatus.Active) {
                revert InvalidStatus();
            }
        }

        delete projects[projectId];

        (bool sent, ) = project.client.call{value: project.amount}("");
        if (!sent) {
            revert RefundFailed();
        }

        emit ProjectCancelled(projectId, eoaAddress, project.client);
    }

    // View project info
    function getProject(uint256 projectId) external view returns (Project memory) {
        return projects[projectId];
    }

    // Get project status
    function getProjectStatus(uint256 projectId) external view returns (ProjectStatus) {
        return projects[projectId].status;
    }
}
