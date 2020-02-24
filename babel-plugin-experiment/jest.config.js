// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  testEnvironment: "node",
  testMatch: [
    "**/src/*.test.[tj]s?(x)",
    "**/test/**/*.[tj]s?(x)",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/test/fixtures/",
    "/test/debug-fixtures/",
  ],
  setupFilesAfterEnv: [
    "./jest.setup.js"
  ],
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest"
  },
};
