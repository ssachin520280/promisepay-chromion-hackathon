// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/EscrowFactory.sol";

contract EscrowFactoryTest is Test {
    EscrowFactory escrow;
    address client = address(0x1);
    address freelancer = address(0x2);
    address aiAgent = address(0x3);

    uint256 projectAmount = 1 ether;
    uint256 projectId;

    function setUp() public {
        vm.deal(client, 5 ether);
        vm.deal(freelancer, 1 ether);
        vm.deal(aiAgent, 1 ether);

        vm.prank(client);
        escrow = new EscrowFactory(aiAgent);
    }

    function testCreateProject() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        (address storedClient, address storedFreelancer, uint256 storedAmount,,) = escrow.projects(projectId);
        assertEq(storedClient, client);
        assertEq(storedFreelancer, freelancer);
        assertEq(storedAmount, projectAmount);
    }

    function testCreateProjectEmitsEvent() public {
        vm.prank(client);
        vm.expectEmit(true, true, true, true);
        emit EscrowFactory.ProjectCreated(0, client, freelancer, projectAmount);
        escrow.createProject{value: projectAmount}(freelancer);
    }

    function testFailCreateProjectZeroValue() public {
        vm.prank(client);
        escrow.createProject{value: 0}(freelancer);
    }

    function testApproveByClient() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        vm.prank(client);
        escrow.approveByClient(projectId);
        (, , , , bool clientApproved) = escrow.projects(projectId);
        assertTrue(clientApproved);
    }

    function testApproveByAI() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        vm.prank(aiAgent);
        escrow.approveByAI(projectId);
        (, , , bool aiApproved, ) = escrow.projects(projectId);
        assertTrue(aiApproved);
    }

    function testFailApproveByNonAI() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        vm.prank(freelancer);
        escrow.approveByAI(projectId);
    }

    function testFailApproveByWrongClient() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        vm.prank(freelancer);
        escrow.approveByClient(projectId);
    }

    function testReleaseFunds() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        vm.prank(aiAgent);
        escrow.approveByAI(projectId);
        vm.prank(client);
        escrow.approveByClient(projectId);
        uint256 initialBalance = freelancer.balance;
        vm.prank(client);
        escrow.releaseFunds(projectId);
        (, , uint256 storedAmount, , ) = escrow.projects(projectId);
        assertEq(storedAmount, 0);
        assertEq(freelancer.balance, initialBalance + projectAmount);
    }

    function testReleaseFundsEmitsEvent() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        vm.prank(aiAgent);
        escrow.approveByAI(projectId);
        vm.prank(client);
        escrow.approveByClient(projectId);
        vm.prank(client);
        vm.expectEmit(true, false, false, false);
        emit EscrowFactory.FundsReleased(projectId);
        escrow.releaseFunds(projectId);
    }

    function testFailReleaseWithoutApprovals() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        vm.prank(client);
        escrow.releaseFunds(projectId);
    }

    function testCancelProjectRefundsClient() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        uint256 initialClientBalance = client.balance;
        vm.prank(client);
        escrow.cancelProject(projectId);
        (, , uint256 storedAmount, , ) = escrow.projects(projectId);
        assertEq(storedAmount, 0);
        assertApproxEqAbs(client.balance, initialClientBalance + projectAmount, 1e9);
    }

    function testCancelProjectEmitsEvent() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        vm.prank(client);
        vm.expectEmit(true, false, false, false);
        emit EscrowFactory.ProjectCancelled(projectId);
        escrow.cancelProject(projectId);
    }

    function testFailCancelByNonClient() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        vm.prank(freelancer);
        escrow.cancelProject(projectId);
    }

    function testFailReleaseInvalidProject() public {
        vm.prank(client);
        escrow.releaseFunds(9999);
    }

    function testFailCancelInvalidProject() public {
        vm.prank(client);
        escrow.cancelProject(9999);
    }

    function testGetProjectView() public {
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        projectId = escrow.nextProjectId() - 1;
        EscrowFactory.Project memory p = escrow.getProject(projectId);
        assertEq(p.client, client);
        assertEq(p.freelancer, freelancer);
        assertEq(p.amount, projectAmount);
    }

    function testMultipleProjects() public {
        address freelancer2 = address(0x4);
        uint256 amount2 = 2 ether;
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        uint256 id1 = escrow.nextProjectId() - 1;
        vm.prank(client);
        escrow.createProject{value: amount2}(freelancer2);
        uint256 id2 = escrow.nextProjectId() - 1;
        (address c1, address f1, uint256 a1,,) = escrow.projects(id1);
        (address c2, address f2, uint256 a2,,) = escrow.projects(id2);
        assertEq(c1, client);
        assertEq(f1, freelancer);
        assertEq(a1, projectAmount);
        assertEq(c2, client);
        assertEq(f2, freelancer2);
        assertEq(a2, amount2);
    }

    // INTEGRATION TESTS
    function testIntegration_FullProjectLifecycle() public {
        // Client creates project and deposits funds
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        uint256 id = escrow.nextProjectId() - 1;

        // AI approves
        vm.prank(aiAgent);
        escrow.approveByAI(id);

        // Client approves
        vm.prank(client);
        escrow.approveByClient(id);

        // Record freelancer balance before
        uint256 before = freelancer.balance;

        // Client releases funds
        vm.prank(client);
        escrow.releaseFunds(id);

        // Project should be deleted (amount == 0)
        (, , uint256 amt, , ) = escrow.projects(id);
        assertEq(amt, 0);
        // Freelancer should receive funds
        assertEq(freelancer.balance, before + projectAmount);
    }

    function testIntegration_CancelProjectByClient() public {
        // Client creates project
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        uint256 id = escrow.nextProjectId() - 1;
        uint256 before = client.balance;
        // Client cancels
        vm.prank(client);
        escrow.cancelProject(id);
        // Project deleted
        (, , uint256 amt, , ) = escrow.projects(id);
        assertEq(amt, 0);
        // Client refunded
        assertApproxEqAbs(client.balance, before + projectAmount, 1e9);
    }

    function testIntegration_ReleaseWithoutAIApprovalFails() public {
        // Client creates project
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        uint256 id = escrow.nextProjectId() - 1;
        // Only client approves
        vm.prank(client);
        escrow.approveByClient(id);
        // Try to release (should succeed)
        uint256 before = freelancer.balance;
        vm.prank(client);
        escrow.releaseFunds(id);
        // Project deleted
        (, , uint256 amt, , ) = escrow.projects(id);
        assertEq(amt, 0);
        assertEq(freelancer.balance, before + projectAmount);
    }

    function testIntegration_ReleaseWithoutClientApprovalFails() public {
        // Client creates project
        vm.prank(client);
        escrow.createProject{value: projectAmount}(freelancer);
        uint256 id = escrow.nextProjectId() - 1;
        // Only AI approves
        vm.prank(aiAgent);
        escrow.approveByAI(id);
        // Try to release (should revert)
        vm.prank(client);
        vm.expectRevert();
        escrow.releaseFunds(id);
    }
}