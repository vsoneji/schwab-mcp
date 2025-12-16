"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.MyMCP = void 0;
var workers_oauth_provider_1 = require("@cloudflare/workers-oauth-provider");
var mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
var schwab_api_1 = require("@sudowealth/schwab-api");
var workers_mcp_1 = require("workers-mcp");
var auth_1 = require("./auth");
var config_1 = require("./config");
var constants_1 = require("./shared/constants");
var kvTokenStore_1 = require("./shared/kvTokenStore");
var log_1 = require("./shared/log");
var secureLogger_1 = require("./shared/secureLogger");
var toolBuilder_1 = require("./shared/toolBuilder");
var tools_1 = require("./tools");
var MyMCP = /** @class */ (function (_super) {
    __extends(MyMCP, _super);
    function MyMCP() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.mcpLogger = log_1.logger.child(constants_1.LOGGER_CONTEXTS.MCP_DO);
        _this.server = new mcp_js_1.McpServer({
            name: constants_1.APP_NAME,
            version: '0.0.1',
        });
        return _this;
    }
    MyMCP.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var logLevel, newLogger, redirectUri, kvToken_1, getTokenIds_1, saveTokenForETM, loadTokenForETM, hadExistingTokenManager, mcpLogger, etmInitSuccess, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // Register a minimal tool synchronously to ensure Claude Desktop detects tools
                        this.server.tool(constants_1.TOOL_NAMES.STATUS, 'Check Schwab MCP server status', {}, function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, ({
                                        content: [
                                            {
                                                type: constants_1.CONTENT_TYPES.TEXT,
                                                text: "".concat(constants_1.APP_SERVER_NAME, " is running. Use tool discovery to see all available tools."),
                                            },
                                        ],
                                    })];
                            });
                        }); });
                        this.validatedConfig = (0, config_1.getConfig)(this.env);
                        logLevel = this.validatedConfig.LOG_LEVEL;
                        newLogger = (0, log_1.buildLogger)(logLevel);
                        // Replace the singleton logger instance
                        Object.assign(log_1.logger, newLogger);
                        redirectUri = this.validatedConfig.SCHWAB_REDIRECT_URI;
                        this.mcpLogger.debug('[MyMCP.init] STEP 0: Start');
                        this.mcpLogger.debug('[MyMCP.init] STEP 1: Env initialized.');
                        kvToken_1 = (0, kvTokenStore_1.makeKvTokenStore)(this.validatedConfig.OAUTH_KV);
                        // Ensure clientId is stored in props for token key derivation
                        if (!this.props.clientId) {
                            this.props.clientId = this.validatedConfig.SCHWAB_CLIENT_ID;
                            this.props = __assign({}, this.props);
                        }
                        getTokenIds_1 = function () { return ({
                            schwabUserId: _this.props.schwabUserId,
                            clientId: _this.props.clientId,
                        }); };
                        // Debug token IDs during initialization
                        (0, secureLogger_1.logOnlyInDevelopment)(this.mcpLogger, 'debug', '[MyMCP.init] Token identifiers', {
                            hasSchwabUserId: !!this.props.schwabUserId,
                            hasClientId: !!this.props.clientId,
                            expectedKeyPrefix: (0, schwab_api_1.sanitizeKeyForLog)(kvToken_1.kvKey(getTokenIds_1())),
                        });
                        saveTokenForETM = function (tokenSet) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, kvToken_1.save(getTokenIds_1(), tokenSet)];
                                    case 1:
                                        _a.sent();
                                        this.mcpLogger.debug('ETM: Token save to KV complete', {
                                            keyPrefix: (0, schwab_api_1.sanitizeKeyForLog)(kvToken_1.kvKey(getTokenIds_1())),
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        loadTokenForETM = function () { return __awaiter(_this, void 0, void 0, function () {
                            var tokenIds, tokenData;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        tokenIds = getTokenIds_1();
                                        this.mcpLogger.debug('[ETM Load] Attempting to load token', {
                                            hasSchwabUserId: !!tokenIds.schwabUserId,
                                            hasClientId: !!tokenIds.clientId,
                                            expectedKeyPrefix: (0, schwab_api_1.sanitizeKeyForLog)(kvToken_1.kvKey(tokenIds)),
                                        });
                                        return [4 /*yield*/, kvToken_1.load(tokenIds)];
                                    case 1:
                                        tokenData = _a.sent();
                                        this.mcpLogger.debug('ETM: Token load from KV complete', {
                                            keyPrefix: (0, schwab_api_1.sanitizeKeyForLog)(kvToken_1.kvKey(tokenIds)),
                                        });
                                        return [2 /*return*/, tokenData];
                                }
                            });
                        }); };
                        this.mcpLogger.debug('[MyMCP.init] STEP 2: Storage and event handlers defined.');
                        hadExistingTokenManager = !!this.tokenManager;
                        this.mcpLogger.debug('[MyMCP.init] STEP 3A: ETM instance setup', {
                            hadExisting: hadExistingTokenManager,
                        });
                        if (!this.tokenManager) {
                            this.tokenManager = (0, auth_1.initializeSchwabAuthClient)(this.validatedConfig, redirectUri, loadTokenForETM, saveTokenForETM); // This is synchronous
                        }
                        this.mcpLogger.debug('[MyMCP.init] STEP 3B: ETM instance ready', {
                            wasReused: hadExistingTokenManager,
                        });
                        mcpLogger = {
                            debug: function (message) {
                                var args = [];
                                for (var _i = 1; _i < arguments.length; _i++) {
                                    args[_i - 1] = arguments[_i];
                                }
                                return _this.mcpLogger.debug(message, args.length > 0 ? args[0] : undefined);
                            },
                            info: function (message) {
                                var args = [];
                                for (var _i = 1; _i < arguments.length; _i++) {
                                    args[_i - 1] = arguments[_i];
                                }
                                return _this.mcpLogger.info(message, args.length > 0 ? args[0] : undefined);
                            },
                            warn: function (message) {
                                var args = [];
                                for (var _i = 1; _i < arguments.length; _i++) {
                                    args[_i - 1] = arguments[_i];
                                }
                                return _this.mcpLogger.warn(message, args.length > 0 ? args[0] : undefined);
                            },
                            error: function (message) {
                                var args = [];
                                for (var _i = 1; _i < arguments.length; _i++) {
                                    args[_i - 1] = arguments[_i];
                                }
                                return _this.mcpLogger.error(message, args.length > 0 ? args[0] : undefined);
                            },
                        };
                        this.mcpLogger.debug('[MyMCP.init] STEP 4: MCP Logger adapted.');
                        // 2. Proactively initialize ETM to load tokens BEFORE creating client
                        this.mcpLogger.debug('[MyMCP.init] STEP 5A: Proactively calling this.tokenManager.initialize() (async)...');
                        etmInitSuccess = this.tokenManager.initialize();
                        this.mcpLogger.debug("[MyMCP.init] STEP 5B: Proactive ETM initialization complete. Success: ".concat(etmInitSuccess));
                        if (!(this.props.schwabUserId && this.props.clientId)) return [3 /*break*/, 2];
                        return [4 /*yield*/, kvToken_1.migrateIfNeeded({ clientId: this.props.clientId }, { schwabUserId: this.props.schwabUserId })];
                    case 1:
                        _a.sent();
                        this.mcpLogger.debug('[MyMCP.init] STEP 5C: Token migration completed');
                        _a.label = 2;
                    case 2:
                        // 3. Create SchwabApiClient AFTER tokens are loaded
                        this.client = (0, schwab_api_1.createApiClient)({
                            config: {
                                environment: constants_1.ENVIRONMENTS.PRODUCTION,
                                logger: mcpLogger,
                                enableLogging: true,
                                logLevel: this.validatedConfig.ENVIRONMENT === 'production'
                                    ? 'error'
                                    : 'debug',
                            },
                            auth: this.tokenManager,
                        });
                        this.mcpLogger.debug('[MyMCP.init] STEP 6: SchwabApiClient ready.');
                        // 4. Register tools (this.server.tool calls are synchronous)
                        this.mcpLogger.debug('[MyMCP.init] STEP 7A: Calling registerTools...');
                        tools_1.allToolSpecs.forEach(function (spec) {
                            (0, toolBuilder_1.createTool)(_this.client, _this.server, {
                                name: spec.name,
                                description: spec.description,
                                schema: spec.schema,
                                handler: function (params, c) { return __awaiter(_this, void 0, void 0, function () {
                                    var data, error_2;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 2, , 3]);
                                                return [4 /*yield*/, spec.call(c, params)];
                                            case 1:
                                                data = _a.sent();
                                                return [2 /*return*/, (0, toolBuilder_1.toolSuccess)({
                                                        data: data,
                                                        source: spec.name,
                                                        message: "Successfully executed ".concat(spec.name),
                                                    })];
                                            case 2:
                                                error_2 = _a.sent();
                                                return [2 /*return*/, (0, toolBuilder_1.toolError)(error_2, { source: spec.name })];
                                            case 3: return [2 /*return*/];
                                        }
                                    });
                                }); },
                            });
                        });
                        this.mcpLogger.debug('[MyMCP.init] STEP 7B: registerTools completed.');
                        this.mcpLogger.debug('[MyMCP.init] STEP 8: MyMCP.init FINISHED SUCCESSFULLY');
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        this.mcpLogger.error('[MyMCP.init] FINAL CATCH: UNHANDLED EXCEPTION in init()', {
                            error: error_1.message,
                            stack: error_1.stack,
                        });
                        throw error_1; // Re-throw to ensure DO framework sees the failure
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MyMCP.prototype.onReconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var token, tokenError_1, initResult, initError_1, error_3, message, stack, initError_2, initMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.mcpLogger.info('Handling reconnection in MyMCP instance');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 12, , 17]);
                        if (!!this.tokenManager) return [3 /*break*/, 3];
                        this.mcpLogger.warn('Token manager not initialized, attempting full initialization');
                        return [4 /*yield*/, this.init()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        this.mcpLogger.info('Attempting reconnection via token manager');
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        this.mcpLogger.info('Attempting to fetch access token as recovery test');
                        return [4 /*yield*/, this.tokenManager.getAccessToken()];
                    case 5:
                        token = _a.sent();
                        if (token) {
                            this.mcpLogger.info('Successfully retrieved access token during reconnection');
                            return [2 /*return*/, true];
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        tokenError_1 = _a.sent();
                        this.mcpLogger.warn('Failed to get access token during reconnection', {
                            error: tokenError_1 instanceof Error
                                ? tokenError_1.message
                                : String(tokenError_1),
                        });
                        return [3 /*break*/, 7];
                    case 7:
                        _a.trys.push([7, 9, , 10]);
                        this.mcpLogger.info('Attempting proactive reinitialization of token manager');
                        return [4 /*yield*/, this.tokenManager.initialize()];
                    case 8:
                        initResult = _a.sent();
                        this.mcpLogger.info("Token manager reinitialization ".concat(initResult ? 'succeeded' : 'failed'));
                        if (initResult) {
                            return [2 /*return*/, true];
                        }
                        return [3 /*break*/, 10];
                    case 9:
                        initError_1 = _a.sent();
                        this.mcpLogger.warn('Token manager reinitialization failed', {
                            error: initError_1 instanceof Error ? initError_1.message : String(initError_1),
                        });
                        return [3 /*break*/, 10];
                    case 10:
                        try {
                            this.mcpLogger.info('Token manager state during reconnection', {
                                hasTokenManager: !!this.tokenManager,
                            });
                        }
                        catch (stateError) {
                            this.mcpLogger.warn('Failed to check token manager state during reconnection', {
                                error: stateError instanceof Error
                                    ? stateError.message
                                    : String(stateError),
                            });
                        }
                        this.mcpLogger.warn('Reconnection recovery attempts failed, performing full reinitialization');
                        return [4 /*yield*/, this.init()];
                    case 11:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 12:
                        error_3 = _a.sent();
                        message = error_3 instanceof Error ? error_3.message : String(error_3);
                        stack = error_3 instanceof Error ? error_3.stack : undefined;
                        this.mcpLogger.error('Critical error during reconnection handling', {
                            error: message,
                            stack: stack,
                        });
                        _a.label = 13;
                    case 13:
                        _a.trys.push([13, 15, , 16]);
                        this.mcpLogger.warn('Attempting emergency reinitialization after reconnection failure');
                        return [4 /*yield*/, this.init()];
                    case 14:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 15:
                        initError_2 = _a.sent();
                        initMessage = initError_2 instanceof Error ? initError_2.message : String(initError_2);
                        this.mcpLogger.error('Emergency reinitialization also failed', {
                            error: initMessage,
                        });
                        return [2 /*return*/, false];
                    case 16: return [3 /*break*/, 17];
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    MyMCP.prototype.onSSE = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.mcpLogger.info('SSE connection established or reconnected');
                        return [4 /*yield*/, this.onReconnect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, _super.prototype.onSSE.call(this, event)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return MyMCP;
}(workers_mcp_1.DurableMCP));
exports.MyMCP = MyMCP;
exports.default = new workers_oauth_provider_1.default({
    apiRoute: constants_1.API_ENDPOINTS.SSE,
    apiHandler: MyMCP.mount(constants_1.API_ENDPOINTS.SSE), // Cast remains due to library typing
    defaultHandler: auth_1.SchwabHandler, // Cast remains
    authorizeEndpoint: constants_1.API_ENDPOINTS.AUTHORIZE,
    tokenEndpoint: constants_1.API_ENDPOINTS.TOKEN,
});
