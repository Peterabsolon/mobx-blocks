/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  coverageReporters: ["clover", "html-spa"],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/scripts/testMock.js",
    "\\.(css|less)$": "<rootDir>/scripts/testMock.js",
  },
  moduleFileExtensions: [
    "web.js",
    "js",
    "web.ts",
    "ts",
    "web.tsx",
    "tsx",
    "json",
    "web.jsx",
    "jsx",
    "node",
  ],
}

module.exports = config
