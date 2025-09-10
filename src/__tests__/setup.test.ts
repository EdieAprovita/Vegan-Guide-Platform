import { describe, test, expect } from '@jest/globals';

describe('Testing Setup', () => {
  test('should be able to run tests', () => {
    expect(true).toBe(true);
  });

  test('should have access to environment variables', () => {
    // These should be available in test environment
    expect(process.env.NEXT_PUBLIC_API_URL).toBeDefined();
  });

  test('should handle basic assertions', () => {
    const testArray = [1, 2, 3];
    const testObject = { name: 'test', active: true };
    
    expect(testArray).toHaveLength(3);
    expect(testObject).toHaveProperty('name');
    expect(testObject.active).toBe(true);
  });
});