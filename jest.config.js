/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!jest.config.js',
    '!server.js',
  ],

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ['/node_modules/', '/coverage/', '/tmp/'],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // An object that configures minimum threshold enforcement for coverage results
  coverageThreshold: {
    global: {
      statements: 90,
    },
  },

  // A set of global variables that need to be available in all test environments
  globals: { NODE_ENV: 'test' },

  // Automatically reset mock state before every test
  resetMocks: true,

  // The glob patterns Jest uses to detect test files
  testMatch: ['**/**/*.test.js'],

  // Indicates whether each individual test should be reported during the run
  verbose: true,
};
