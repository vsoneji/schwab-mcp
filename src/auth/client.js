"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSchwabAuthClient = initializeSchwabAuthClient;
exports.redirectToSchwab = redirectToSchwab;
var schwab_api_1 = require("@sudowealth/schwab-api");
var constants_1 = require("../shared/constants");
var log_1 = require("../shared/log");
var errors_1 = require("./errors");
var tokenPersistence_1 = require("./tokenPersistence");
// Create scoped logger for auth client
var authLogger = log_1.logger.child(constants_1.LOGGER_CONTEXTS.AUTH_CLIENT);
/**
 * Creates a Schwab Auth client with enhanced features
 *
 * @param redirectUri OAuth callback URI
 * @param load Function to load tokens from storage
 * @param save Function to save tokens to storage
 * @returns Initialized Schwab auth client as EnhancedTokenManager
 */
function initializeSchwabAuthClient(config, redirectUri, load, save) {
    if (redirectUri === void 0) { redirectUri = config.SCHWAB_REDIRECT_URI; }
    var clientId = config.SCHWAB_CLIENT_ID;
    var clientSecret = config.SCHWAB_CLIENT_SECRET;
    authLogger.debug('Using centralized environment for Schwab Auth client');
    authLogger.info('Initializing enhanced Schwab Auth client', {
        hasLoadFunction: !!load,
        hasSaveFunction: !!save,
    });
    // Map our load/save functions to what EnhancedTokenManager expects
    var _a = (0, tokenPersistence_1.mapTokenPersistence)(load, save), mappedLoad = _a.load, mappedSave = _a.save;
    // Build options for EnhancedTokenManager with MCP-specific defaults
    var tokenManagerOptions = {
        clientId: clientId,
        clientSecret: clientSecret,
        redirectUri: redirectUri,
        load: mappedLoad,
        save: mappedSave,
        validateTokens: true,
        autoReconnect: true,
        debug: config.LOG_LEVEL === 'debug' || config.LOG_LEVEL === 'trace',
        traceOperations: config.LOG_LEVEL === 'trace',
        refreshThresholdMs: 5 * 60 * 1000,
    };
    // Configure auth with enhanced token manager
    var authConfig = {
        strategy: schwab_api_1.AuthStrategy.ENHANCED,
        oauthConfig: tokenManagerOptions,
    };
    var authClient = (0, schwab_api_1.createSchwabAuth)(authConfig);
    return authClient;
}
/**
 * Redirects the user to Schwab's authorization page
 *
 * @param c Hono context
 * @param config Validated environment configuration
 * @param oauthReqInfo OAuth request information
 * @param headers Optional headers to include in the response
 * @returns Redirect response to Schwab's authorization page
 */
function redirectToSchwab(c_1, config_1, oauthReqInfo_1) {
    return __awaiter(this, arguments, void 0, function (c, config, oauthReqInfo, headers) {
        var auth, encodedState, authUrl, error_1, authError, errorInfo;
        if (headers === void 0) { headers = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    auth = initializeSchwabAuthClient(config);
                    encodedState = (0, schwab_api_1.encodeOAuthState)(oauthReqInfo);
                    return [4 /*yield*/, auth.getAuthorizationUrl({
                            state: encodedState,
                        })
                        // Create redirect response with any additional headers
                    ];
                case 1:
                    authUrl = (_a.sent()).authUrl;
                    // Create redirect response with any additional headers
                    if (Object.keys(headers).length > 0) {
                        return [2 /*return*/, new Response(null, {
                                status: 302,
                                headers: __assign({ Location: authUrl }, headers),
                            })];
                    }
                    else {
                        return [2 /*return*/, Response.redirect(authUrl, 302)];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    authError = new errors_1.AuthErrors.AuthUrl(error_1 instanceof Error ? error_1 : undefined);
                    errorInfo = (0, errors_1.formatAuthError)(authError, { error: error_1 });
                    authLogger.error(errorInfo.message, { error: error_1 });
                    return [2 /*return*/, new Response(errorInfo.message, { status: errorInfo.status })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
