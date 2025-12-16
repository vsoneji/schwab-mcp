"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logOnlyInDevelopment = logOnlyInDevelopment;
var schwab_api_1 = require("@sudowealth/schwab-api");
// Keep any MCP-specific logging logic
function logOnlyInDevelopment(logger, level, message, data) {
    if (process.env.NODE_ENV !== 'production') {
        logger[level](message, data ? (0, schwab_api_1.sanitizeError)(data) : undefined);
    }
}
