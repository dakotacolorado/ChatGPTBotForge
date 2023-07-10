// test-setup.js
const dotenv = require('dotenv-flow');
dotenv.config({ path: '.env' });
module.exports = {
    testTimeout: 20000, // Set the timeout to 20 seconds
};