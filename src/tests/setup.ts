/**
 * Jest Setup File
 * Runs before tests
 */

import 'dotenv/config';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://user:password@localhost:5432/aina_test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-only';

// Suppress logs during tests
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});
