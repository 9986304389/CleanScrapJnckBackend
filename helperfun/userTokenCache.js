const NodeCache = require("node-cache");

// Initialize a new cache instance
const userTokenCache = new NodeCache();

module.exports = userTokenCache;
