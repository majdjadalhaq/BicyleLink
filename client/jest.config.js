export default {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["./setupTests.js"],
  transform: {
    "^.+\\.(js|jsx)$": ["babel-jest", {
      presets: [
        ["@babel/preset-env", { targets: { node: "current" } }],
        ["@babel/preset-react", { runtime: "automatic" }]
      ],
      plugins: [
        "@babel/plugin-transform-runtime",
        "babel-plugin-transform-import-meta"
      ]
    }],
  },
  moduleNameMapper: {
    "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js",
    "\\.(jpg|jpeg|png|svg)$": "<rootDir>/__mocks__/fileMock.js",
    "^(.+)/utils/config$": "<rootDir>/src/utils/__mocks__/config.js",
  },
};
