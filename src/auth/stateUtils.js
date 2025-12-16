"use strict";
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
exports.decodeAndVerifyState = decodeAndVerifyState;
exports.extractClientIdFromState = extractClientIdFromState;
var schwab_api_1 = require("@sudowealth/schwab-api");
var constants_1 = require("../shared/constants");
var log_1 = require("../shared/log");
var errors_1 = require("./errors");
var schemas_1 = require("./schemas");
// Create scoped logger for OAuth state operations
var stateLogger = log_1.logger.child(constants_1.LOGGER_CONTEXTS.STATE_UTILS);
/**
 * Decodes and verifies a state parameter from OAuth callback.
 * This is now a thin wrapper around the SDK's enhanced function
 */
function decodeAndVerifyState(config, stateParam) {
    return __awaiter(this, void 0, void 0, function () {
        var decoded, authRequest;
        return __generator(this, function (_a) {
            try {
                decoded = (0, schwab_api_1.decodeAndVerifyState)(stateParam, {
                    schema: schemas_1.StateSchema, // MCP-specific schema
                    requiredFields: ['clientId'], // MCP requires clientId
                });
                if (!decoded) {
                    stateLogger.error('Failed to decode state parameter');
                    return [2 /*return*/, null];
                }
                authRequest = decoded;
                if (authRequest.responseType && authRequest.clientId) {
                    stateLogger.debug('Processing valid OAuth state');
                    return [2 /*return*/, decoded];
                }
                stateLogger.error('Missing required OAuth fields in state');
                return [2 /*return*/, null];
            }
            catch (error) {
                stateLogger.error('[ERROR] Error decoding state:', error);
                return [2 /*return*/, null];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Extracts the client ID from a state object
 * Delegates to SDK implementation
 */
function extractClientIdFromState(state) {
    var clientId = (0, schwab_api_1.extractClientIdFromState)(state);
    if (!clientId) {
        throw new errors_1.AuthErrors.ClientIdExtraction();
    }
    return clientId;
}
