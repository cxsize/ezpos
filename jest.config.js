/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^expo-crypto$': '<rootDir>/test/mocks/expo-crypto.ts',
    '^react-native$': '<rootDir>/test/mocks/react-native.ts',
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/test/mocks/async-storage.ts',
  },
  setupFiles: ['<rootDir>/test/setup.ts'],
  collectCoverageFrom: [
    'src/lib/money.ts',
    'src/lib/search.ts',
    'src/lib/promptpay.ts',
    'src/lib/shop.ts',
    'src/lib/pin.ts',
    'src/hardware/escpos.ts',
    'src/hardware/devbus.ts',
    'src/state/sale.ts',
    'src/state/parked.ts',
  ],
  coverageReporters: ['text', 'text-summary', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          target: 'es2020',
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          resolveJsonModule: true,
          baseUrl: '.',
          paths: { '~/*': ['src/*'] },
        },
        diagnostics: { warnOnly: true },
      },
    ],
  },
};
