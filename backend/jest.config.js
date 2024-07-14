module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    setupFiles: ['<rootDir>/jest.setup.js'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    moduleDirectories: ['node_modules', 'src'],
  };