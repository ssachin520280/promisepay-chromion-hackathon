// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Consumer.sol";
import "../src/EscrowFactory.sol";

contract ConsumerTest is Test {
    Consumer public consumer;
    EscrowFactory public escrowFactory;
    
    address public client = address(0x1);
    address public freelancer = address(0x2);
    address public aiAgent = address(0x3);
    address public consumerContract = address(0x4);
    
    uint256 public projectId;
    uint64 public subscriptionId = 1;

    function setUp() public {
        // Deploy EscrowFactory
        escrowFactory = new EscrowFactory(aiAgent);
        
        // Deploy Consumer
        consumer = new Consumer(address(escrowFactory));
        
        // Set consumer contract in EscrowFactory
        escrowFactory.updateConsumerContract(address(consumer));
        
        // Fund accounts
        vm.deal(client, 10 ether);
        vm.deal(freelancer, 1 ether);
    }

    function testCreateProject() public {
        vm.startPrank(client);
        
        escrowFactory.createProject{value: 1 ether}(freelancer);
        projectId = 0; // First project
        
        EscrowFactory.Project memory project = escrowFactory.getProject(projectId);
        assertEq(project.client, client);
        assertEq(project.freelancer, freelancer);
        assertEq(project.amount, 1 ether);
        assertEq(uint256(project.status), uint256(EscrowFactory.ProjectStatus.Pending));
        assertGt(project.creationTimestamp, 0);
        
        vm.stopPrank();
    }

    function testRequestCancellation() public {
        // First create a project
        testCreateProject();
        
        // Wait 2 minutes (120 seconds)
        vm.warp(block.timestamp + 121);
        
        vm.startPrank(client);
        
        // Request cancellation
        bytes32 requestId = consumer.requestCancellation(projectId, client, subscriptionId);
        
        // Verify request was created
        Consumer.CancellationRequest memory request = consumer.getCancellationRequest(requestId);
        assertEq(request.projectId, projectId);
        assertEq(request.eoaAddress, client);
        assertTrue(request.isPending);
        
        vm.stopPrank();
    }

    function testRequestCancellationTooEarly() public {
        // First create a project
        testCreateProject();
        
        // Wait only 1 minute (60 seconds) - should be too early
        vm.warp(block.timestamp + 60);
        
        vm.startPrank(client);
        
        // Request cancellation
        bytes32 requestId = consumer.requestCancellation(projectId, client, subscriptionId);
        
        // Verify request was created
        Consumer.CancellationRequest memory request = consumer.getCancellationRequest(requestId);
        assertEq(request.projectId, projectId);
        assertEq(request.eoaAddress, client);
        assertTrue(request.isPending);
        
        vm.stopPrank();
    }

    function testRequestCancellationByUnauthorized() public {
        // First create a project
        testCreateProject();
        
        address unauthorized = address(0x999);
        vm.startPrank(unauthorized);
        
        // Should revert
        vm.expectRevert(Consumer.CancellationNotAllowed.selector);
        consumer.requestCancellation(projectId, unauthorized, subscriptionId);
        
        vm.stopPrank();
    }

    function testRequestCancellationInvalidProject() public {
        vm.startPrank(client);
        
        // Should revert for non-existent project
        vm.expectRevert(Consumer.InvalidProject.selector);
        consumer.requestCancellation(999, client, subscriptionId);
        
        vm.stopPrank();
    }

    function testGetLastRequest() public {
        // First create a project
        testCreateProject();
        
        vm.startPrank(client);
        
        // Request cancellation
        bytes32 requestId = consumer.requestCancellation(projectId, client, subscriptionId);
        
        // Get last request details
        (bytes32 lastRequestId, bytes memory response, bytes memory error) = consumer.getLastRequest();
        assertEq(lastRequestId, requestId);
        // Verify response and error are initialized (empty bytes for new request)
        assertEq(response.length, 0);
        assertEq(error.length, 0);
        
        vm.stopPrank();
    }

    function testConsumerContractAddress() public view {
        assertEq(consumer.escrowFactory.address, address(escrowFactory));
    }

    function testOwnerIsSetCorrectly() public view {
        assertEq(consumer.owner(), address(this));
    }

    function testRequestCancellationByFreelancer() public {
        // First create a project
        testCreateProject();
        
        // Wait 2 minutes
        vm.warp(block.timestamp + 121);
        
        vm.startPrank(freelancer);
        
        // Request cancellation
        bytes32 requestId = consumer.requestCancellation(projectId, freelancer, subscriptionId);
        
        // Verify request was created
        Consumer.CancellationRequest memory request = consumer.getCancellationRequest(requestId);
        assertEq(request.projectId, projectId);
        assertEq(request.eoaAddress, freelancer);
        assertTrue(request.isPending);
        
        vm.stopPrank();
    }

    function testMultipleCancellationRequests() public {
        // Create multiple projects
        vm.startPrank(client);
        
        escrowFactory.createProject{value: 1 ether}(freelancer);
        uint256 projectId1 = 0;
        
        escrowFactory.createProject{value: 2 ether}(freelancer);
        uint256 projectId2 = 1;
        
        vm.stopPrank();
        
        // Wait 2 minutes
        vm.warp(block.timestamp + 121);
        
        vm.startPrank(client);
        
        // Request cancellation for both projects
        bytes32 requestId1 = consumer.requestCancellation(projectId1, client, subscriptionId);
        bytes32 requestId2 = consumer.requestCancellation(projectId2, client, subscriptionId);
        
        // Verify both requests were created
        Consumer.CancellationRequest memory request1 = consumer.getCancellationRequest(requestId1);
        Consumer.CancellationRequest memory request2 = consumer.getCancellationRequest(requestId2);
        
        assertEq(request1.projectId, projectId1);
        assertEq(request2.projectId, projectId2);
        assertTrue(request1.isPending);
        assertTrue(request2.isPending);
        
        vm.stopPrank();
    }

    function testUint2strHelper() public view {
        // Test the uint2str helper function
        assertEq(consumer.uint2str(0), "0");
        assertEq(consumer.uint2str(123), "123");
        assertEq(consumer.uint2str(999999), "999999");
    }
} 