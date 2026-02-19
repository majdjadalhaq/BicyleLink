const { defineConfig } = require("cypress");

module.exports = defineConfig({
  backendUrl: "http://localhost:3000",
  e2e: {
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    specPattern: ["cypress/e2e/**/*.spec.js", "cypress/e2e/**/*.cy.js"],
    baseUrl: "http://localhost:5173",
  },
});
