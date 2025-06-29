# Consumer Contract Documentation

## Overview

The `Consumer` contract integrates Chainlink Functions with the `EscrowFactory` to handle cancellation requests based on time validation. It ensures that cancellation requests are only processed if more than 2 minutes have passed since the project creation.

## Key Features

- **Time-based Validation**: Uses Chainlink Functions to validate that at least 2 minutes have passed since project creation
- **Authorization**: Only the client or freelancer of a project can request cancellation
- **Integration**: Seamlessly integrates with the EscrowFactory contract
- **Event Tracking**: Comprehensive event logging for monitoring and debugging

## Contract Structure

### State Variables

- `escrowFactory`: Immutable reference to the EscrowFactory contract
- `cancellationRequests`: Mapping to track pending cancellation requests
- `s_lastRequestId`, `s_lastResponse`, `s_lastError`: Chainlink Functions state variables

### Events

- `CancellationRequestInitiated`: Emitted when a cancellation request is initiated
- `CancellationRequestFulfilled`: Emitted when Chainlink Functions responds
- `CancellationExecuted`: Emitted when cancellation is executed on EscrowFactory

## Functions

### `requestCancellation(uint256 projectId, address eoaAddress, uint64 subscriptionId)`

Initiates a cancellation request for a project.

**Parameters:**
- `projectId`: The ID of the project to cancel
- `eoaAddress`: The EOA address requesting cancellation
- `subscriptionId`: The Chainlink subscription ID

**Requirements:**
- Caller must be either the client or freelancer of the project
- Project must exist
- Chainlink subscription must be funded

**Returns:**
- `requestId`: The ID of the Chainlink Functions request

### `fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err)`

Internal callback function called by Chainlink Functions.

**Parameters:**
- `requestId`: The ID of the request being fulfilled
- `response`: The response from Chainlink Functions
- `err`: Any errors from the request

**Logic:**
- Validates the response
- If approved, calls `escrowFactory.cancelProject()`
- Emits events for tracking

## Chainlink Functions Integration

### JavaScript Source Code

The contract uses inline JavaScript to validate time constraints:

```javascript
const projectId = args[0];
const creationTime = args[1];
const currentTime = Math.floor(Date.now() / 1000);
const timeDiff = currentTime - parseInt(creationTime);
const minTimeRequired = 120; // 2 minutes in seconds

if (timeDiff >= minTimeRequired) {
  return Functions.encodeString('APPROVED');
} else {
  return Functions.encodeString('DENIED');
}
```

### Configuration

- **Router**: `0xb83E47C2bC239B3bf370bc41e1459A34b41238D0` (Sepolia)
- **DON ID**: `0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000`
- **Gas Limit**: 300,000

## Deployment

### Prerequisites

1. Deploy the `EscrowFactory` contract
2. Set up a Chainlink Functions subscription
3. Fund the subscription with LINK tokens

### Environment Variables

Create a `.env` file with:

```env
PRIVATE_KEY=your_private_key
ESCROW_FACTORY_ADDRESS=deployed_escrow_factory_address
```

### Deployment Command

```bash
forge script script/DeployConsumer.s.sol --rpc-url $RPC_URL --broadcast --verify
```

## Usage Example

```solidity
// 1. Deploy Consumer contract
Consumer consumer = new Consumer(escrowFactoryAddress);

// 2. Request cancellation (must be called by client or freelancer)
bytes32 requestId = consumer.requestCancellation(
    projectId,
    msg.sender,
    subscriptionId
);

// 3. Monitor events for request status
// - CancellationRequestInitiated: Request sent to Chainlink
// - CancellationRequestFulfilled: Response received
// - CancellationExecuted: Cancellation completed (if approved)
```

## Testing

Run the test suite:

```bash
forge test --match-contract ConsumerTest -vv
```

## Security Considerations

1. **Authorization**: Only project participants can request cancellation
2. **Time Validation**: Chainlink Functions provides decentralized time validation
3. **Reentrancy Protection**: EscrowFactory includes ReentrancyGuard
4. **Error Handling**: Comprehensive error handling and event logging

## Integration with Frontend

The frontend should:

1. Listen for `CancellationRequestInitiated` events
2. Monitor `CancellationRequestFulfilled` events for approval status
3. Update UI based on `CancellationExecuted` events
4. Handle errors gracefully and provide user feedback

## Troubleshooting

### Common Issues

1. **"UnexpectedRequestID"**: Request ID mismatch, check Chainlink configuration
2. **"InvalidProject"**: Project doesn't exist or has been deleted
3. **"CancellationNotAllowed"**: Caller is not authorized for this project
4. **"RequestAlreadyPending"**: Duplicate request for same project

### Debugging

1. Check Chainlink subscription funding
2. Verify router and DON ID configuration
3. Monitor events for request flow
4. Validate project status in EscrowFactory 