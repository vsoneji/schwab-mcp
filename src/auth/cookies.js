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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientIdAlreadyApproved = clientIdAlreadyApproved;
exports.parseRedirectApproval = parseRedirectApproval;
var schwab_api_1 = require("@sudowealth/schwab-api");
var constants_1 = require("../shared/constants");
var log_1 = require("../shared/log");
var errors_1 = require("./errors");
var schemas_1 = require("./schemas");
var stateUtils_1 = require("./stateUtils");
// Create scoped logger for cookie operations
var cookieLogger = log_1.logger.child(constants_1.LOGGER_CONTEXTS.COOKIES);
var MCP_APPROVAL = constants_1.COOKIE_NAMES.APPROVED_CLIENTS;
var ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;
// Initialize cookie store for approved clients
var approvalCookieStore = null;
/**
 * Get or create the approval cookie store
 */
function getApprovalCookieStore(secret) {
    if (!approvalCookieStore) {
        var options = {
            encryptionKey: secret,
            cookieName: MCP_APPROVAL,
            cookieOptions: {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: ONE_YEAR_IN_SECONDS,
                path: '/',
            },
            validateOnLoad: false, // We'll validate with Zod schema
        };
        approvalCookieStore = (0, schwab_api_1.createCookieTokenStore)(options);
    }
    return approvalCookieStore;
}
/**
 * Extracts and validates the approved clients from the cookie.
 */
function parseApprovalCookie(cookieHeader, secret) {
    return __awaiter(this, void 0, void 0, function () {
        var store, data, approvedClients, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    store = getApprovalCookieStore(secret);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, store.load(cookieHeader)];
                case 2:
                    data = _a.sent();
                    if (!data) {
                        return [2 /*return*/, undefined];
                    }
                    // We store the client IDs as a JSON string in the accessToken field
                    try {
                        approvedClients = JSON.parse(data.accessToken);
                        return [2 /*return*/, schemas_1.ApprovedClientsSchema.parse(approvedClients)];
                    }
                    catch (e) {
                        cookieLogger.warn('Cookie payload validation failed:', e);
                        return [2 /*return*/, undefined];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    cookieLogger.error('Error parsing approval cookie:', error_1);
                    return [2 /*return*/, undefined];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Sets the approval cookie with the provided client IDs.
 */
function setApprovalCookie(approvedClients, secret) {
    return __awaiter(this, void 0, void 0, function () {
        var store, pseudoTokenData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    store = getApprovalCookieStore(secret);
                    pseudoTokenData = {
                        accessToken: JSON.stringify(approvedClients), // Store as JSON string
                        refreshToken: '',
                        expiresAt: Date.now() + ONE_YEAR_IN_SECONDS * 1000,
                    };
                    return [4 /*yield*/, store.save(pseudoTokenData)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function clientIdAlreadyApproved(request, clientId, cookieSecret) {
    return __awaiter(this, void 0, void 0, function () {
        var cookieHeader, approvedClients;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!clientId)
                        return [2 /*return*/, false];
                    cookieHeader = request.headers.get('Cookie');
                    return [4 /*yield*/, parseApprovalCookie(cookieHeader, cookieSecret)];
                case 1:
                    approvedClients = _b.sent();
                    return [2 /*return*/, (_a = approvedClients === null || approvedClients === void 0 ? void 0 : approvedClients.includes(clientId)) !== null && _a !== void 0 ? _a : false];
            }
        });
    });
}
function parseRedirectApproval(request, config) {
    return __awaiter(this, void 0, void 0, function () {
        var cookieSecret, encodedState, state, clientId, formData, stateParam, decodedState, decodedStateJson, oauthDecoded, e_1, cookieHeader, existingApprovedClients, updatedApprovedClients, cookieHeaderValue;
        var _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    cookieSecret = config.COOKIE_ENCRYPTION_KEY;
                    if (request.method !== 'POST') {
                        throw new errors_1.AuthErrors.InvalidRequestMethod();
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, request.formData()];
                case 2:
                    formData = _c.sent();
                    stateParam = formData.get('state');
                    if (typeof stateParam !== 'string' || !stateParam) {
                        throw new errors_1.AuthErrors.MissingFormState();
                    }
                    encodedState = stateParam;
                    decodedState = void 0;
                    try {
                        decodedStateJson = atob(encodedState);
                        decodedState = JSON.parse(decodedStateJson);
                    }
                    catch (_d) {
                        // If standard base64 decoding fails, try the OAuth decoder as fallback
                        cookieLogger.warn('Standard base64 decode failed, trying OAuth decoder');
                        oauthDecoded = (0, schwab_api_1.decodeOAuthState)(encodedState);
                        if (!oauthDecoded) {
                            throw new errors_1.AuthErrors.InvalidState();
                        }
                        decodedState = oauthDecoded;
                    }
                    state = decodedState;
                    clientId = (0, stateUtils_1.extractClientIdFromState)(state);
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _c.sent();
                    cookieLogger.error('Error processing form submission:', e_1);
                    if (e_1 instanceof errors_1.AuthErrors.InvalidState ||
                        e_1 instanceof errors_1.AuthErrors.MissingFormState ||
                        e_1 instanceof errors_1.AuthErrors.ClientIdExtraction) {
                        throw e_1;
                    }
                    throw new errors_1.AuthErrors.CookieDecode(e_1 instanceof Error ? e_1 : undefined);
                case 4:
                    cookieHeader = request.headers.get('Cookie');
                    return [4 /*yield*/, parseApprovalCookie(cookieHeader, cookieSecret)];
                case 5:
                    existingApprovedClients = (_b = (_c.sent())) !== null && _b !== void 0 ? _b : [];
                    updatedApprovedClients = Array.from(new Set(__spreadArray(__spreadArray([], existingApprovedClients, true), [clientId], false)));
                    return [4 /*yield*/, setApprovalCookie(updatedApprovedClients, cookieSecret)];
                case 6:
                    cookieHeaderValue = _c.sent();
                    return [2 /*return*/, {
                            state: state,
                            headers: (_a = {}, _a[constants_1.HTTP_HEADERS.SET_COOKIE] = cookieHeaderValue, _a),
                        }];
            }
        });
    });
}
