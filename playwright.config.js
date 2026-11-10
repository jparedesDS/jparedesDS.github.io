// Playwright is invoked from the repository root by the npm scripts, so this
// root config simply re-exports the shared configuration in test/.
module.exports = require("./test/playwright.config.js");
