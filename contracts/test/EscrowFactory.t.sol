// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/EscrowFactory.sol";

contract EscrowFactoryTest is Test {
    EscrowFactory escrow;
    address client = address(0x1);
    address freelancer = address(0x2);
    address aiAgent = address(0x3);
    address consumerContract = address(0x4);

    uint256 projectAmount = 1 ether;
    uint256 projectId;

    function setUp() public {
        vm.deal(client, 5 ether);
        vm.deal(freelancer, 1 ether);
        vm.deal(aiAgent, 1 ether);
        vm.deal(consumerContract, 1 ether);

        vm.prank(client);
        escrow = new EscrowFactory(aiAgent);
        
        // Set the consumer contract address
        vm.prank(client);
        escrow.updateConsumerContract(consumerContract);
    }

    // ========== PROJECT CREATION TESTS ==========
    function testCreateProject() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        EscrowFactory.Project memory project = escrow.getProject(projectId);
        assertEq(project.client, client);
        assertEq(project.freelancer, freelancer);
        assertEq(project.amount, projectAmount);
        assertEq(uint256(project.status), uint256(EscrowFactory.ProjectStatus.Pending));
        assertEq(project.aiResponse, "");
    }

    function testCreateProjectEmitsEvent() public {
        vm.prank(client);
        vm.expectEmit(true, true, true, true);
        emit EscrowFactory.ProjectCreated(0, client, freelancer, projectAmount);
        escrow.createProject{value: projectAmount}(freelancer);
    }

    function test_RevertWhen_CreateProjectWithZeroValue() public {
        vm.prank(client);
        vm.expectRevert(EscrowFactory.ZeroValue.selector);
        escrow.createProject{value: 0}(freelancer);
    }

    // ========== CONTRACT ACCEPTANCE TESTS ==========
    function testAcceptContract() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        vm.prank(freelancer);
        escrow.acceptContract(projectId);
        
        EscrowFactory.ProjectStatus status = escrow.getProjectStatus(projectId);
        assertEq(uint256(status), uint256(EscrowFactory.ProjectStatus.Active));
    }

    function testAcceptContractEmitsEvent() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        vm.prank(freelancer);
        vm.expectEmit(true, false, false, false);
        emit EscrowFactory.ProjectAccepted(projectId, freelancer);
        escrow.acceptContract(projectId);
    }

    function test_RevertWhen_AcceptContractByNonFreelancer() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        vm.prank(client);
        vm.expectRevert(EscrowFactory.NotFreelancer.selector);
        escrow.acceptContract(projectId);
    }

    function test_RevertWhen_AcceptContractWithWrongStatus() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        vm.prank(freelancer);
        escrow.acceptContract(projectId);
        
        // Try to accept again (should fail)
        vm.prank(freelancer);
        vm.expectRevert(EscrowFactory.InvalidStatus.selector);
        escrow.acceptContract(projectId);
    }

    // ========== WORK SUBMISSION TESTS ==========
    function testSubmitWork() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        vm.prank(freelancer);
        escrow.acceptContract(projectId);
        
        vm.prank(freelancer);
        escrow.submitWork(projectId);
        
        EscrowFactory.ProjectStatus status = escrow.getProjectStatus(projectId);
        assertEq(uint256(status), uint256(EscrowFactory.ProjectStatus.Submitted));
    }

    function testSubmitWorkEmitsEvent() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        vm.prank(freelancer);
        escrow.acceptContract(projectId);
        
        vm.prank(freelancer);
        vm.expectEmit(true, false, false, false);
        emit EscrowFactory.ProjectSubmitted(projectId, freelancer);
        escrow.submitWork(projectId);
    }

    function test_RevertWhen_SubmitWorkByNonFreelancer() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        vm.prank(freelancer);
        escrow.acceptContract(projectId);
        
        vm.prank(client);
        vm.expectRevert(EscrowFactory.NotFreelancer.selector);
        escrow.submitWork(projectId);
    }

    function test_RevertWhen_SubmitWorkWithWrongStatus() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        // Try to submit without accepting (should fail)
        vm.prank(freelancer);
        vm.expectRevert(EscrowFactory.InvalidStatus.selector);
        escrow.submitWork(projectId);
    }

    // ========== AI APPROVAL TESTS ==========
    function testApproveByAI() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        vm.prank(freelancer);
        escrow.acceptContract(projectId);
        
        vm.prank(freelancer);
        escrow.submitWork(projectId);
        
        string memory aiResponse = "Yes. Work quality is excellent and meets all requirements.";
        vm.prank(aiAgent);
        escrow.approveByAI(projectId, aiResponse);
        
        EscrowFactory.Project memory project = escrow.getProject(projectId);
        assertEq(project.aiResponse, aiResponse);
    }

    function testApproveByAIEmitsEvent() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        vm.prank(freelancer);
        escrow.acceptContract(projectId);
        
        vm.prank(freelancer);
        escrow.submitWork(projectId);
        
        string memory aiResponse = "Work quality is excellent and meets all requirements.";
        vm.prank(aiAgent);
        vm.expectEmit(true, false, false, true);
        emit EscrowFactory.ProjectApproved(projectId, aiAgent, aiResponse);
        escrow.approveByAI(projectId, aiResponse);
    }

    function test_RevertWhen_ApproveByNonAI() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        vm.prank(freelancer);
        escrow.acceptContract(projectId);
        
        vm.prank(freelancer);
        escrow.submitWork(projectId);
        
        vm.prank(freelancer);
        vm.expectRevert(EscrowFactory.NotAI.selector);
        escrow.approveByAI(projectId, "test response");
    }

    function test_RevertWhen_ApproveByAIWithWrongStatus() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        vm.prank(freelancer);
        escrow.acceptContract(projectId);
        
        // Try to approve without submission (should fail)
        vm.prank(aiAgent);
        vm.expectRevert(EscrowFactory.InvalidStatus.selector);
        escrow.approveByAI(projectId, "test response");
    }

    // ========== FUND RELEASE TESTS ==========
    function testReleaseFundsActive() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        vm.prank(freelancer);
        escrow.acceptContract(projectId);
        
        uint256 initialBalance = freelancer.balance;
        vm.prank(client);
        escrow.releaseFunds(projectId);
        
        EscrowFactory.Project memory project = escrow.getProject(projectId);
        assertEq(project.amount, 0); // Project should be deleted
        assertEq(freelancer.balance, initialBalance + projectAmount);
    }

    function testReleaseFundsSubmitted() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        vm.prank(freelancer);
        escrow.acceptContract(projectId);
        
        vm.prank(freelancer);
        escrow.submitWork(projectId);
        
        uint256 initialBalance = freelancer.balance;
        vm.prank(client);
        escrow.releaseFunds(projectId);
        
        EscrowFactory.Project memory project = escrow.getProject(projectId);
        assertEq(project.amount, 0); // Project should be deleted
        assertEq(freelancer.balance, initialBalance + projectAmount);
    }

    function testReleaseFundsEmitsEvent() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        vm.prank(freelancer);
        escrow.acceptContract(projectId);
        
        vm.prank(client);
        vm.expectEmit(true, false, false, false);
        emit EscrowFactory.FundsReleased(projectId, freelancer, projectAmount);
        escrow.releaseFunds(projectId);
    }

    function test_RevertWhen_ReleaseByNonClient() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        vm.prank(freelancer);
        escrow.acceptContract(projectId);
        
        vm.prank(freelancer);
        vm.expectRevert(EscrowFactory.NotClient.selector);
        escrow.releaseFunds(projectId);
    }

    function test_RevertWhen_ReleaseWithWrongStatus() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        // Try to release in pending status (should fail)
        vm.prank(client);
        vm.expectRevert(EscrowFactory.InvalidStatus.selector);
        escrow.releaseFunds(projectId);
    }

    // ========== PROJECT CANCELLATION TESTS ==========
    function testCancelProjectByClient() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        uint256 initialClientBalance = client.balance;
        vm.prank(consumerContract);
        escrow.cancelProject(projectId, client);
        
        EscrowFactory.Project memory project = escrow.getProject(projectId);
        assertEq(project.amount, 0); // Project should be deleted
        assertApproxEqAbs(client.balance, initialClientBalance + projectAmount, 1e9);
    }

    function testCancelProjectByFreelancer() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        vm.prank(freelancer);
        escrow.acceptContract(projectId);
        
        uint256 initialClientBalance = client.balance;
        vm.prank(consumerContract);
        escrow.cancelProject(projectId, freelancer);
        
        EscrowFactory.Project memory project = escrow.getProject(projectId);
        assertEq(project.amount, 0); // Project should be deleted
        assertApproxEqAbs(client.balance, initialClientBalance + projectAmount, 1e9);
    }

    function testCancelProjectEmitsEvent() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        vm.prank(consumerContract);
        vm.expectEmit(true, false, false, false);
        emit EscrowFactory.ProjectCancelled(projectId, client, client);
        escrow.cancelProject(projectId, client);
    }

    function test_RevertWhen_CancelByNonConsumerContract() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        vm.prank(client);
        vm.expectRevert(EscrowFactory.NotConsumerContract.selector);
        escrow.cancelProject(projectId, client);
    }

    function test_RevertWhen_CancelByUnauthorizedEOA() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        address unauthorized = address(0x999);
        vm.prank(consumerContract);
        vm.expectRevert(EscrowFactory.UnauthorizedCancellation.selector);
        escrow.cancelProject(projectId, unauthorized);
    }

    // ========== VIEW FUNCTION TESTS ==========
    function testGetProject() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        EscrowFactory.Project memory project = escrow.getProject(projectId);
        assertEq(project.client, client);
        assertEq(project.freelancer, freelancer);
        assertEq(project.amount, projectAmount);
        assertEq(uint256(project.status), uint256(EscrowFactory.ProjectStatus.Pending));
    }

    function testGetProjectStatus() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        EscrowFactory.ProjectStatus status = escrow.getProjectStatus(projectId);
        assertEq(uint256(status), uint256(EscrowFactory.ProjectStatus.Pending));
    }

    // ========== INTEGRATION TESTS ==========
    function testIntegration_FullProjectLifecycle() public {
        // Client creates project
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        assertEq(uint256(escrow.getProjectStatus(projectId)), uint256(EscrowFactory.ProjectStatus.Pending));
        
        // Freelancer accepts contract
        vm.prank(freelancer);
        escrow.acceptContract(projectId);
        assertEq(uint256(escrow.getProjectStatus(projectId)), uint256(EscrowFactory.ProjectStatus.Active));
        
        // Freelancer submits work
        vm.prank(freelancer);
        escrow.submitWork(projectId);
        assertEq(uint256(escrow.getProjectStatus(projectId)), uint256(EscrowFactory.ProjectStatus.Submitted));
        
        // AI approves work
        string memory aiResponse = "Yes. Excellent work quality!";
        vm.prank(aiAgent);
        escrow.approveByAI(projectId, aiResponse);
        
        // Client releases funds
        uint256 initialBalance = freelancer.balance;
        vm.prank(client);
        escrow.releaseFunds(projectId);
        
        EscrowFactory.Project memory project = escrow.getProject(projectId);
        assertEq(project.amount, 0); // Project should be deleted
        assertEq(freelancer.balance, initialBalance + projectAmount);
    }

    function testIntegration_ClientReleasesEarly() public {
        // Client creates project
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        // Freelancer accepts contract
        vm.prank(freelancer);
        escrow.acceptContract(projectId);
        
        // Client releases funds early (in active state)
        uint256 initialBalance = freelancer.balance;
        vm.prank(client);
        escrow.releaseFunds(projectId);
        
        EscrowFactory.Project memory project = escrow.getProject(projectId);
        assertEq(project.amount, 0); // Project should be deleted
        assertEq(freelancer.balance, initialBalance + projectAmount);
    }

    function testIntegration_CancelByClient() public {
        // Client creates project
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        uint256 initialClientBalance = client.balance;
        vm.prank(consumerContract);
        escrow.cancelProject(projectId, client);
        
        EscrowFactory.Project memory project = escrow.getProject(projectId);
        assertEq(project.amount, 0); // Project should be deleted
        assertApproxEqAbs(client.balance, initialClientBalance + projectAmount, 1e9);
    }

    function testIntegration_CancelByFreelancer() public {
        // Client creates project
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        // Freelancer accepts contract
        vm.prank(freelancer);
        escrow.acceptContract(projectId);
        
        uint256 initialClientBalance = client.balance;
        vm.prank(consumerContract);
        escrow.cancelProject(projectId, freelancer);
        
        EscrowFactory.Project memory project = escrow.getProject(projectId);
        assertEq(project.amount, 0); // Project should be deleted
        assertApproxEqAbs(client.balance, initialClientBalance + projectAmount, 1e9);
    }

    function testMultipleProjects() public {
        address freelancer2 = address(0x5);
        uint256 amount2 = 2 ether;
        
        // Create first project
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        uint256 id1 = escrow.nextProjectId() - 1;
        
        // Create second project
        vm.prank(client);
        escrow.createProject{value: amount2}(freelancer2);
        uint256 id2 = escrow.nextProjectId() - 1;
        
        EscrowFactory.Project memory p1 = escrow.getProject(id1);
        EscrowFactory.Project memory p2 = escrow.getProject(id2);
        
        assertEq(p1.client, client);
        assertEq(p1.freelancer, freelancer);
        assertEq(p1.amount, projectAmount);
        assertEq(p2.client, client);
        assertEq(p2.freelancer, freelancer2);
        assertEq(p2.amount, amount2);
    }

    // ========== OWNER FUNCTIONALITY TESTS ==========
    function testOwnerIsSetCorrectly() public view {
        assertEq(escrow.owner(), client);
    }

    function testUpdateConsumerContract() public {
        address newConsumer = address(0x999);
        
        vm.prank(client);
        escrow.updateConsumerContract(newConsumer);
        
        assertEq(escrow.consumerContract(), newConsumer);
    }

    function testUpdateConsumerContractEmitsEvent() public {
        address newConsumer = address(0x999);
        
        vm.prank(client);
        escrow.updateConsumerContract(newConsumer);
        
        // Note: We would need to add an event to the contract to test this properly
        // For now, we just verify the state change
        assertEq(escrow.consumerContract(), newConsumer);
    }

    function test_RevertWhen_UpdateConsumerContractByNonOwner() public {
        address newConsumer = address(0x999);
        
        vm.prank(freelancer);
        vm.expectRevert("Not owner");
        escrow.updateConsumerContract(newConsumer);
    }

    function test_RevertWhen_UpdateConsumerContractToZeroAddress() public {
        vm.prank(client);
        vm.expectRevert("Zero address");
        escrow.updateConsumerContract(address(0));
    }

    function testCancelProjectWithUpdatedConsumer() public {
        // Update consumer contract
        address newConsumer = address(0x999);
        vm.prank(client);
        escrow.updateConsumerContract(newConsumer);
        
        // Create project
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        // Cancel with new consumer contract
        uint256 initialClientBalance = client.balance;
        vm.prank(newConsumer);
        escrow.cancelProject(projectId, client);
        
        EscrowFactory.Project memory project = escrow.getProject(projectId);
        assertEq(project.amount, 0); // Project should be deleted
        assertApproxEqAbs(client.balance, initialClientBalance + projectAmount, 1e9);
    }

    function test_RevertWhen_CancelProjectWithZeroConsumerContract() public {
        // Set consumer contract to zero address
        vm.prank(client);
        escrow.updateConsumerContract(address(0));
        
        // Create project
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        
        // Try to cancel - should revert due to zero consumer contract
        vm.prank(consumerContract);
        vm.expectRevert(EscrowFactory.NotConsumerContract.selector);
        escrow.cancelProject(projectId, client);
    }
}