# Real-Time Sync Testing Suite

## Overview

This testing suite provides comprehensive coverage for the real-time synchronization functionality implemented in NexLAB. The tests ensure that user course data updates automatically across the UI without requiring page reloads.

## Test Structure

### 1. Unit Tests

#### `services/userService.test.ts`
- Tests the `userService` real-time subscription functionality
- Validates Firebase Firestore integration
- Tests error handling and edge cases
- Ensures proper subscription cleanup

#### `contexts/UserContext.test.tsx`
- Tests the `UserContext` provider component
- Validates real-time user details updates
- Tests authentication state changes
- Ensures proper subscription management to prevent infinite loops

### 2. Integration Tests

#### `integration/realTimeSync.test.tsx`
- Tests the complete real-time sync workflow
- Validates UI updates when course data changes
- Tests course addition, removal, and modification scenarios
- Ensures proper integration between UserContext and components

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Files
```bash
# User Service tests
npm test userService.test.ts

# User Context tests
npm test UserContext.test.tsx

# Integration tests
npm test realTimeSync.test.tsx
```

### Watch Mode
```bash
npm test -- --watch
```

### Coverage Report
```bash
npm run test:coverage
```

### UI Mode (Interactive)
```bash
npm run test:ui
```

## Test Scenarios Covered

### ✅ Core Functionality
- User authentication and details fetching
- Real-time subscription setup and cleanup
- Course list updates without page reload
- Error handling and fallback mechanisms

### ✅ Real-Time Updates
- New course addition
- Course removal
- Course title/number updates
- Empty course list handling
- Multiple rapid updates

### ✅ Edge Cases
- Network errors and Firebase failures
- Invalid user data
- Subscription cleanup on unmount
- Infinite loop prevention
- Multiple subscription management

### ✅ Integration Testing
- Complete user workflow from auth to course display
- UI component updates with real-time data
- State management across component tree
- Performance under multiple updates

## Key Testing Features

### Mocking Strategy
- **Firebase Services**: Comprehensive mocks for Firestore operations
- **Authentication**: Mock auth state changes and user objects
- **Real-time Subscriptions**: Controllable callback triggers
- **Environment Variables**: Test-specific configuration

### Assertion Coverage
- **State Management**: Verifies correct state updates
- **UI Updates**: Ensures components reflect data changes
- **Subscription Management**: Validates proper cleanup
- **Error Handling**: Tests graceful failure scenarios

### Performance Testing
- **Subscription Efficiency**: Single subscription per user
- **Update Frequency**: Handles rapid successive updates
- **Memory Management**: Proper cleanup prevents leaks
- **Render Optimization**: Minimal unnecessary re-renders

## Debugging Tests

### Console Output
Tests include comprehensive logging for debugging:
```bash
# View detailed test output
npm test -- --reporter=verbose

# Debug specific test
npm test -- --reporter=verbose userService.test.ts
```

### Test Isolation
Each test runs in isolation with:
- Fresh mock instances
- Clean state management
- Independent Firebase connections
- Isolated component rendering

## Continuous Integration

### GitHub Actions Integration
Tests are automatically run on:
- Pull request creation
- Push to main branch
- Release preparation

### Coverage Requirements
- **Minimum Coverage**: 80% for real-time sync code
- **Critical Paths**: 100% coverage for subscription management
- **Error Scenarios**: All error paths tested

## Maintenance

### Adding New Tests
When adding new real-time sync features:

1. **Add Unit Tests**: Test the service/context layer
2. **Add Integration Tests**: Test the complete user workflow
3. **Update Mocks**: Ensure Firebase mocks support new features
4. **Document Scenarios**: Add new test scenarios to this README

### Test Data Management
- **Mock Data**: Centralized in test setup files
- **User Fixtures**: Reusable test user objects
- **Course Data**: Standardized test course structures
- **State Scenarios**: Predefined state transition tests

## Troubleshooting

### Common Issues

**Tests timeout**: Increase timeout for async operations
```bash
npm test -- --timeout=10000
```

**Mock not working**: Clear mock state between tests
```javascript
beforeEach(() => {
  vi.clearAllMocks();
});
```

**Firebase errors**: Ensure proper Firebase mocking in setup.ts

### Performance Issues
- Use `act()` for state updates in tests
- Wait for async operations with `waitFor()`
- Mock heavy Firebase operations
- Limit test data size for faster execution

---

*Last Updated: January 2025*  
*Version: 1.0*  
*Test Suite: Real-Time Sync*
