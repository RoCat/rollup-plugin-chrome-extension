module.exports = {
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/manifest-input/browser/**/*',
    '!src/simple-reloader/client/**/*',
  ],
  coverageReporters: ['json-summary', 'text', 'lcov'],
  moduleNameMapper: {
    'code .+': '<rootDir>/__fixtures__/bundle-imports-stub.ts',
  },
  modulePathIgnorePatterns: ['~~.+', '__fixtures__', 'client'],
  preset: 'ts-jest',
  reporters: [
    'default',
    // 'jest-html-reporters'
  ],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  transform: {
    // Use Sucrase to convert ES6 modules in JS files
    '.(js|jsx)': '@sucrase/jest-plugin',
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!lodash-es/.*)',
  ],
  globals: {
    'ts-jest': {
      packageJson: 'package.json',
    },
  },
}
