const { defineConfig } = require("cypress");

module.exports = defineConfig({
  // The quality setting for the video compression, in Constant Rate Factor (CRF).
  // The value can be false to disable compression or a value between 0 and 51, where a lower value results in better quality (at the expense of a higher file size).
  videoCompression: 15,
  reporter: "junit",
  reporterOptions: {
    mochaFile: "cypress/results/output.xml",
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    defaultCommandTimeout: 15000,
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    baseUrl: "http://localhost:8080",
    watchForFileChanges: false,
    retries: { runMode: 1, openMode: 1 },
  },
});
