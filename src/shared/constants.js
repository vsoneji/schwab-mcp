"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTL_31_DAYS = exports.TOKEN_KEY_PREFIX = exports.CONTENT_TYPES = exports.ENVIRONMENTS = exports.TOOL_NAMES = exports.API_ENDPOINTS = exports.LOGGER_CONTEXTS = exports.HTTP_HEADERS = exports.COOKIE_NAMES = exports.APP_SERVER_NAME = exports.APP_NAME = void 0;
/**
 * Application Constants
 */
exports.APP_NAME = 'Schwab MCP';
exports.APP_SERVER_NAME = 'Schwab MCP Server';
/**
 * Cookie Constants
 */
exports.COOKIE_NAMES = {
    APPROVED_CLIENTS: 'mcp-approved-clients',
};
/**
 * HTTP Header Constants
 */
exports.HTTP_HEADERS = {
    COOKIE: 'Cookie',
    SET_COOKIE: 'Set-Cookie',
};
/**
 * Logger Context Names
 */
exports.LOGGER_CONTEXTS = {
    MCP_DO: 'mcp-do',
    OAUTH_HANDLER: 'oauth-handler',
    COOKIES: 'cookies',
    AUTH_CLIENT: 'auth-client',
    STATE_UTILS: 'state-utils',
    KV_TOKEN_STORE: 'kv-token-store',
};
/**
 * API Endpoints
 */
exports.API_ENDPOINTS = {
    SSE: '/sse',
    AUTHORIZE: '/authorize',
    TOKEN: '/token',
    CALLBACK: '/callback',
    REGISTER: '/register',
};
/**
 * Tool Names
 */
exports.TOOL_NAMES = {
    STATUS: 'status',
};
/**
 * Environment Constants
 */
exports.ENVIRONMENTS = {
    PRODUCTION: 'PRODUCTION',
};
/**
 * Content Types
 */
exports.CONTENT_TYPES = {
    TEXT: 'text',
};
/**
 * KV Token Store Constants
 */
exports.TOKEN_KEY_PREFIX = 'token:';
exports.TTL_31_DAYS = 31 * 24 * 60 * 60;
