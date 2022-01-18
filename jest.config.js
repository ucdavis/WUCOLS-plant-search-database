const { jest: jestConfig } = require('kcd-scripts/config')

module.exports = Object.assign(jestConfig, {
  globalSetup: '<rootDir>/src/setupJest',
  modulePaths: ['<rootDir>/src/'],

  transform: {
    ...jestConfig.transform,
    '\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest',
  },

  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
})