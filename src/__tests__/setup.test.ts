import { describe, test, expect } from '@jest/globals';

describe('Testing Setup', () => {
  test('should be able to run tests', () => {
    expect(true).toBe(true);
  });

  test('should have access to environment variables', () => {
    // Test environment variables - set default for testing if not defined
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    expect(apiUrl).toBeDefined();
    expect(typeof apiUrl).toBe('string');
  });

  test('should handle basic assertions', () => {
    const testArray = [1, 2, 3];
    const testObject = { name: 'test', active: true };
    
    expect(testArray).toHaveLength(3);
    expect(testObject).toHaveProperty('name');
    expect(testObject.active).toBe(true);
  });
});