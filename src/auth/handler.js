'use strict'
var __assign =
	(this && this.__assign) ||
	function () {
		__assign =
			Object.assign ||
			function (t) {
				for (var s, i = 1, n = arguments.length; i < n; i++) {
					s = arguments[i]
					for (var p in s)
						if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
				}
				return t
			}
		return __assign.apply(this, arguments)
	}
var __awaiter =
	(this && this.__awaiter) ||
	function (thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function (resolve) {
						resolve(value)
					})
		}
		return new (P || (P = Promise))(function (resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value))
				} catch (e) {
					reject(e)
				}
			}
			function rejected(value) {
				try {
					step(generator['throw'](value))
				} catch (e) {
					reject(e)
				}
			}
			function step(result) {
				result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected)
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next())
		})
	}
var __generator =
	(this && this.__generator) ||
	function (thisArg, body) {
		var _ = {
				label: 0,
				sent: function () {
					if (t[0] & 1) throw t[1]
					return t[1]
				},
				trys: [],
				ops: [],
			},
			f,
			y,
			t,
			g = Object.create(
				(typeof Iterator === 'function' ? Iterator : Object).prototype,
			)
		return (
			(g.next = verb(0)),
			(g['throw'] = verb(1)),
			(g['return'] = verb(2)),
			typeof Symbol === 'function' &&
				(g[Symbol.iterator] = function () {
					return this
				}),
			g
		)
		function verb(n) {
			return function (v) {
				return step([n, v])
			}
		}
		function step(op) {
			if (f) throw new TypeError('Generator is already executing.')
			while ((g && ((g = 0), op[0] && (_ = 0)), _))
				try {
					if (
						((f = 1),
						y &&
							(t =
								op[0] & 2
									? y['return']
									: op[0]
										? y['throw'] || ((t = y['return']) && t.call(y), 0)
										: y.next) &&
							!(t = t.call(y, op[1])).done)
					)
						return t
					if (((y = 0), t)) op = [op[0] & 2, t.value]
					switch (op[0]) {
						case 0:
						case 1:
							t = op
							break
						case 4:
							_.label++
							return { value: op[1], done: false }
						case 5:
							_.label++
							y = op[1]
							op = [0]
							continue
						case 7:
							op = _.ops.pop()
							_.trys.pop()
							continue
						default:
							if (
								!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
								(op[0] === 6 || op[0] === 2)
							) {
								_ = 0
								continue
							}
							if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
								_.label = op[1]
								break
							}
							if (op[0] === 6 && _.label < t[1]) {
								_.label = t[1]
								t = op
								break
							}
							if (t && _.label < t[2]) {
								_.label = t[2]
								_.ops.push(op)
								break
							}
							if (t[2]) _.ops.pop()
							_.trys.pop()
							continue
					}
					op = body.call(thisArg, _)
				} catch (e) {
					op = [6, e]
					y = 0
				} finally {
					f = t = 0
				}
			if (op[0] & 5) throw op[1]
			return { value: op[0] ? op[1] : void 0, done: true }
		}
	}
Object.defineProperty(exports, '__esModule', { value: true })
exports.SchwabHandler = void 0
var schwab_api_1 = require('@sudowealth/schwab-api')
var hono_1 = require('hono')
var config_1 = require('../config')
var constants_1 = require('../shared/constants')
var kvTokenStore_1 = require('../shared/kvTokenStore')
var log_1 = require('../shared/log')
var client_1 = require('./client')
var cookies_1 = require('./cookies')
var errorMapping_1 = require('./errorMapping')
var errors_1 = require('./errors')
var stateUtils_1 = require('./stateUtils')
var approvalDialog_1 = require('./ui/approvalDialog')
var config_2 = require('./ui/config')
// Create Hono app with appropriate bindings
var app = new hono_1.Hono()
exports.SchwabHandler = app
// Create a scoped logger for OAuth handlers
var oauthLogger = log_1.logger.child(constants_1.LOGGER_CONTEXTS.OAUTH_HANDLER)
// No need to store config locally, we'll build it per request
/**
 * GET /authorize - Entry point for OAuth authorization flow
 *
 * This endpoint checks if the client is already approved, and either:
 * 1. Redirects directly to Schwab if approved
 * 2. Shows the approval dialog
 */
app.get('/authorize', function (c) {
	return __awaiter(void 0, void 0, void 0, function () {
		var config,
			oauthReqInfo,
			clientId,
			error,
			errorInfo,
			jsonResponse,
			clientInfo,
			serverInfo,
			error_1,
			authError,
			errorInfo,
			jsonResponse
		return __generator(this, function (_a) {
			switch (_a.label) {
				case 0:
					_a.trys.push([0, 4, , 5])
					config = (0, config_1.getConfig)(c.env)
					return [4 /*yield*/, c.env.OAUTH_PROVIDER.parseAuthRequest(c.req.raw)]
				case 1:
					oauthReqInfo = _a.sent()
					clientId = oauthReqInfo.clientId
					if (!clientId) {
						error = new errors_1.AuthErrors.MissingClientId()
						errorInfo = (0, errors_1.formatAuthError)(error)
						oauthLogger.error(errorInfo.message)
						jsonResponse = (0, errors_1.createJsonErrorResponse)(error)
						return [2 /*return*/, c.json(jsonResponse, errorInfo.status)]
					}
					return [
						4 /*yield*/,
						(0, cookies_1.clientIdAlreadyApproved)(
							c.req.raw,
							oauthReqInfo.clientId,
							config.COOKIE_ENCRYPTION_KEY,
						),
					]
				case 2:
					// If client ID is already approved, redirect directly to Schwab
					if (_a.sent()) {
						return [
							2 /*return*/,
							(0, client_1.redirectToSchwab)(c, config, oauthReqInfo),
						]
					}
					return [4 /*yield*/, c.env.OAUTH_PROVIDER.lookupClient(clientId)]
				case 3:
					clientInfo = _a.sent()
					serverInfo = {
						name: constants_1.APP_SERVER_NAME,
						logo: config_2.APPROVAL_CONFIG.SHOW_LOGO
							? config_2.APPROVAL_CONFIG.LOGO_URL
							: undefined,
					}
					return [
						2 /*return*/,
						(0, approvalDialog_1.renderApprovalDialog)(c.req.raw, {
							client: clientInfo,
							server: serverInfo,
							state: { oauthReqInfo: oauthReqInfo },
							config: config,
						}),
					]
				case 4:
					error_1 = _a.sent()
					authError = new errors_1.AuthErrors.AuthRequest()
					errorInfo = (0, errors_1.formatAuthError)(authError, {
						error: error_1,
					})
					oauthLogger.error(errorInfo.message, {
						error: (0, schwab_api_1.sanitizeError)(error_1),
					})
					jsonResponse = (0, errors_1.createJsonErrorResponse)(authError)
					return [2 /*return*/, c.json(jsonResponse, errorInfo.status)]
				case 5:
					return [2 /*return*/]
			}
		})
	})
})
/**
 * POST /authorize - Handle approval dialog submission
 *
 * After the user approves the request, this endpoint processes the form submission
 * and redirects to Schwab for authentication
 */
app.post('/authorize', function (c) {
	return __awaiter(void 0, void 0, void 0, function () {
		var config,
			_a,
			state,
			headers,
			error,
			errorInfo,
			jsonResponse,
			authRequestForSchwab,
			error,
			errorInfo,
			jsonResponse,
			error_2,
			authError,
			errorInfo,
			jsonResponse
		return __generator(this, function (_b) {
			switch (_b.label) {
				case 0:
					_b.trys.push([0, 2, , 3])
					config = (0, config_1.getConfig)(c.env)
					return [
						4 /*yield*/,
						(0, cookies_1.parseRedirectApproval)(c.req.raw, config),
					]
				case 1:
					;(_a = _b.sent()), (state = _a.state), (headers = _a.headers)
					if (!state.oauthReqInfo) {
						error = new errors_1.AuthErrors.MissingState()
						errorInfo = (0, errors_1.formatAuthError)(error)
						oauthLogger.error(errorInfo.message)
						jsonResponse = (0, errors_1.createJsonErrorResponse)(error)
						return [2 /*return*/, c.json(jsonResponse, errorInfo.status)]
					}
					authRequestForSchwab = state.oauthReqInfo
					// Validate required AuthRequest fields before passing to redirectToSchwab
					if (
						!(authRequestForSchwab === null || authRequestForSchwab === void 0
							? void 0
							: authRequestForSchwab.clientId) ||
						!(authRequestForSchwab === null || authRequestForSchwab === void 0
							? void 0
							: authRequestForSchwab.scope)
					) {
						error = new errors_1.AuthErrors.InvalidState()
						errorInfo = (0, errors_1.formatAuthError)(error, {
							missingFields: {
								clientId: !(authRequestForSchwab === null ||
								authRequestForSchwab === void 0
									? void 0
									: authRequestForSchwab.clientId),
								scope: !(authRequestForSchwab === null ||
								authRequestForSchwab === void 0
									? void 0
									: authRequestForSchwab.scope),
							},
						})
						oauthLogger.error(errorInfo.message)
						jsonResponse = (0, errors_1.createJsonErrorResponse)(
							error,
							undefined,
							errorInfo.details,
						)
						return [2 /*return*/, c.json(jsonResponse, errorInfo.status)]
					}
					return [
						2 /*return*/,
						(0, client_1.redirectToSchwab)(
							c,
							config,
							authRequestForSchwab,
							headers,
						),
					]
				case 2:
					error_2 = _b.sent()
					authError = new errors_1.AuthErrors.AuthApproval()
					errorInfo = (0, errors_1.formatAuthError)(authError, {
						error: error_2,
					})
					oauthLogger.error(errorInfo.message, {
						error: (0, schwab_api_1.sanitizeError)(error_2),
					})
					jsonResponse = (0, errors_1.createJsonErrorResponse)(authError)
					return [2 /*return*/, c.json(jsonResponse, errorInfo.status)]
				case 3:
					return [2 /*return*/]
			}
		})
	})
})
/**
 * OAuth Callback Endpoint
 *
 * This route handles the callback from Schwab after user authentication.
 * It exchanges the temporary code for an access token and completes the
 * authorization flow.
 */
app.get('/callback', function (c) {
	return __awaiter(void 0, void 0, void 0, function () {
		var config,
			stateParam,
			code,
			error,
			errorInfo,
			jsonResponse,
			decodedStateAsAuthRequest,
			error,
			errorInfo,
			jsonResponse,
			clientIdFromState_1,
			error,
			errorInfo,
			jsonResponse,
			redirectUri,
			kvToken_1,
			getInitialTokenIds_1,
			saveToken,
			loadToken,
			auth,
			exchangeError_1,
			client,
			userPreferences,
			preferencesError_1,
			userIdFromSchwab,
			error,
			errorInfo,
			jsonResponse,
			currentTokenData,
			migrationError_1,
			redirectTo,
			error_3,
			isSchwabAuthError,
			isSchwabApiErrorInstance,
			mcpError,
			detailMessage,
			httpStatus,
			requestId,
			schwabAuthErr,
			errorMapping,
			schwabApiErr,
			errorInfo,
			jsonResponse
		var _a, _b
		return __generator(this, function (_c) {
			switch (_c.label) {
				case 0:
					_c.trys.push([0, 17, , 18])
					config = (0, config_1.getConfig)(c.env)
					stateParam = c.req.query('state')
					code = c.req.query('code')
					if (!stateParam || !code) {
						error = new errors_1.AuthErrors.MissingParameters()
						errorInfo = (0, errors_1.formatAuthError)(error, {
							hasState: !!stateParam,
							hasCode: !!code,
						})
						oauthLogger.error(errorInfo.message)
						jsonResponse = (0, errors_1.createJsonErrorResponse)(
							error,
							undefined,
							errorInfo.details,
						)
						return [2 /*return*/, c.json(jsonResponse, errorInfo.status)]
					}
					return [
						4 /*yield*/,
						(0, stateUtils_1.decodeAndVerifyState)(config, stateParam),
					]
				case 1:
					decodedStateAsAuthRequest = _c.sent()
					if (!decodedStateAsAuthRequest) {
						error = new errors_1.AuthErrors.InvalidState()
						errorInfo = (0, errors_1.formatAuthError)(error)
						oauthLogger.error(errorInfo.message)
						jsonResponse = (0, errors_1.createJsonErrorResponse)(error)
						return [2 /*return*/, c.json(jsonResponse, errorInfo.status)]
					}
					clientIdFromState_1 = (0, stateUtils_1.extractClientIdFromState)(
						decodedStateAsAuthRequest,
					)
					// Validate required AuthRequest fields directly on `decodedStateAsAuthRequest`
					if (
						!(decodedStateAsAuthRequest === null ||
						decodedStateAsAuthRequest === void 0
							? void 0
							: decodedStateAsAuthRequest.clientId) || // Should be redundant due to extractClientIdFromState
						!(decodedStateAsAuthRequest === null ||
						decodedStateAsAuthRequest === void 0
							? void 0
							: decodedStateAsAuthRequest.redirectUri) ||
						!(decodedStateAsAuthRequest === null ||
						decodedStateAsAuthRequest === void 0
							? void 0
							: decodedStateAsAuthRequest.scope)
					) {
						error = new errors_1.AuthErrors.InvalidState()
						errorInfo = (0, errors_1.formatAuthError)(error, {
							detail:
								'Decoded state object from Schwab callback is missing required AuthRequest fields (clientId, redirectUri, or scope).',
						})
						oauthLogger.error(errorInfo.message)
						jsonResponse = (0, errors_1.createJsonErrorResponse)(
							error,
							undefined,
							errorInfo.details,
						)
						return [2 /*return*/, c.json(jsonResponse, errorInfo.status)]
					}
					redirectUri = config.SCHWAB_REDIRECT_URI
					kvToken_1 = (0, kvTokenStore_1.makeKvTokenStore)(config.OAUTH_KV)
					getInitialTokenIds_1 = function () {
						return { clientId: clientIdFromState_1 }
					}
					saveToken = function (tokenData) {
						return __awaiter(void 0, void 0, void 0, function () {
							return __generator(this, function (_a) {
								switch (_a.label) {
									case 0:
										return [
											4 /*yield*/,
											kvToken_1.save(getInitialTokenIds_1(), tokenData),
										]
									case 1:
										_a.sent()
										return [2 /*return*/]
								}
							})
						})
					}
					loadToken = function () {
						return __awaiter(void 0, void 0, void 0, function () {
							return __generator(this, function (_a) {
								switch (_a.label) {
									case 0:
										return [4 /*yield*/, kvToken_1.load(getInitialTokenIds_1())]
									case 1:
										return [2 /*return*/, _a.sent()]
								}
							})
						})
					}
					auth = (0, client_1.initializeSchwabAuthClient)(
						config,
						redirectUri,
						loadToken,
						saveToken,
					)
					// Exchange the code for tokens with enhanced error handling
					oauthLogger.info(
						'Exchanging authorization code for tokens with state parameter for PKCE',
					)
					_c.label = 2
				case 2:
					_c.trys.push([2, 4, , 5])
					// Pass the stateParam directly to EnhancedTokenManager.exchangeCode
					// EnhancedTokenManager will handle extracting the code_verifier from it
					return [4 /*yield*/, auth.exchangeCode(code, stateParam)]
				case 3:
					// Pass the stateParam directly to EnhancedTokenManager.exchangeCode
					// EnhancedTokenManager will handle extracting the code_verifier from it
					_c.sent()
					return [3 /*break*/, 5]
				case 4:
					exchangeError_1 = _c.sent()
					oauthLogger.error('Token exchange failed', {
						error: (0, schwab_api_1.sanitizeError)(exchangeError_1),
						message:
							exchangeError_1 instanceof Error
								? exchangeError_1.message
								: String(exchangeError_1),
					})
					throw new errors_1.AuthErrors.TokenExchange()
				case 5:
					// Log token exchange success (without sensitive details)
					oauthLogger.info('Token exchange successful')
					// Create API client (temporary for auth flow)
					oauthLogger.info('Creating Schwab API client')
					client = void 0
					try {
						client = (0, schwab_api_1.createApiClient)({
							config: { environment: 'PRODUCTION' },
							auth: auth,
						})
					} catch (clientError) {
						oauthLogger.error('Failed to create API client', {
							error: (0, schwab_api_1.sanitizeError)(clientError),
							message:
								clientError instanceof Error
									? clientError.message
									: String(clientError),
						})
						throw new errors_1.AuthErrors.AuthCallback()
					}
					// Fetch user info to get the Schwab user ID
					oauthLogger.info('Fetching user preferences to get Schwab user ID')
					userPreferences = void 0
					_c.label = 6
				case 6:
					_c.trys.push([6, 8, , 9])
					return [4 /*yield*/, client.trader.userPreference.getUserPreference()]
				case 7:
					userPreferences = _c.sent()
					return [3 /*break*/, 9]
				case 8:
					preferencesError_1 = _c.sent()
					oauthLogger.error('Failed to fetch user preferences', {
						error: (0, schwab_api_1.sanitizeError)(preferencesError_1),
						message:
							preferencesError_1 instanceof Error
								? preferencesError_1.message
								: String(preferencesError_1),
					})
					throw new errors_1.AuthErrors.NoUserId()
				case 9:
					userIdFromSchwab =
						(_b =
							(_a =
								userPreferences === null || userPreferences === void 0
									? void 0
									: userPreferences.streamerInfo) === null || _a === void 0
								? void 0
								: _a[0]) === null || _b === void 0
							? void 0
							: _b.schwabClientCorrelId
					if (!userIdFromSchwab) {
						error = new errors_1.AuthErrors.NoUserId()
						errorInfo = (0, errors_1.formatAuthError)(error)
						oauthLogger.error(errorInfo.message)
						jsonResponse = (0, errors_1.createJsonErrorResponse)(error)
						return [2 /*return*/, c.json(jsonResponse, errorInfo.status)]
					}
					_c.label = 10
				case 10:
					_c.trys.push([10, 14, , 15])
					return [
						4 /*yield*/,
						kvToken_1.load({
							clientId: clientIdFromState_1,
						}),
					]
				case 11:
					currentTokenData = _c.sent()
					if (!currentTokenData) return [3 /*break*/, 13]
					// Save under schwabUserId key
					return [
						4 /*yield*/,
						kvToken_1.save(
							{ schwabUserId: userIdFromSchwab },
							currentTokenData,
						),
					]
				case 12:
					// Save under schwabUserId key
					_c.sent()
					oauthLogger.info('Token migrated to schwabUserId key', {
						fromKeyPrefix: (0, schwab_api_1.sanitizeKeyForLog)(
							kvToken_1.kvKey({ clientId: clientIdFromState_1 }),
						),
						toKeyPrefix: (0, schwab_api_1.sanitizeKeyForLog)(
							kvToken_1.kvKey({ schwabUserId: userIdFromSchwab }),
						),
					})
					_c.label = 13
				case 13:
					return [3 /*break*/, 15]
				case 14:
					migrationError_1 = _c.sent()
					oauthLogger.warn(
						'Token migration failed, continuing with authorization',
						{
							error:
								migrationError_1 instanceof Error
									? migrationError_1.message
									: String(migrationError_1),
						},
					)
					return [3 /*break*/, 15]
				case 15:
					return [
						4 /*yield*/,
						c.env.OAUTH_PROVIDER.completeAuthorization({
							request: decodedStateAsAuthRequest,
							userId: userIdFromSchwab,
							metadata: { label: userIdFromSchwab },
							scope: decodedStateAsAuthRequest.scope,
							props: {
								// Only store IDs for token key derivation - tokens are in KV
								schwabUserId: userIdFromSchwab,
								clientId: clientIdFromState_1,
							},
						}),
					]
				case 16:
					redirectTo = _c.sent().redirectTo
					return [2 /*return*/, Response.redirect(redirectTo)]
				case 17:
					error_3 = _c.sent()
					isSchwabAuthError = error_3 instanceof schwab_api_1.SchwabAuthError
					isSchwabApiErrorInstance =
						error_3 instanceof schwab_api_1.SchwabApiError
					mcpError = new errors_1.AuthErrors.AuthCallback() // Default MCP error for this handler
					detailMessage =
						error_3 instanceof Error ? error_3.message : String(error_3)
					httpStatus = 500 // Default HTTP status
					requestId = void 0
					if (isSchwabAuthError) {
						schwabAuthErr = error_3
						errorMapping = (0, errorMapping_1.mapSchwabError)(
							schwabAuthErr.code,
							schwabAuthErr.message,
							schwabAuthErr.status,
						)
						mcpError = errorMapping.mcpError
						detailMessage = errorMapping.detailMessage
						httpStatus = errorMapping.httpStatus
						// Extract requestId if available
						if (typeof schwabAuthErr.getRequestId === 'function') {
							requestId = schwabAuthErr.getRequestId()
						}
					} else if (isSchwabApiErrorInstance) {
						schwabApiErr = error_3
						mcpError = new errors_1.AuthErrors.ApiResponse()
						detailMessage = 'API request failed during authorization: '.concat(
							schwabApiErr.message,
						)
						httpStatus = schwabApiErr.status || 500
						// Extract requestId if available
						if (typeof schwabApiErr.getRequestId === 'function') {
							requestId = schwabApiErr.getRequestId()
						}
					}
					errorInfo = (0, errors_1.formatAuthError)(mcpError, {
						error: error_3,
						sdkErrorMessage: detailMessage,
						sdkErrorCode: isSchwabAuthError
							? error_3.code
							: isSchwabApiErrorInstance
								? error_3.code
								: undefined,
						sdkStatus: httpStatus,
						requestId: requestId,
					})
					oauthLogger.error(
						'Auth callback failed: '.concat(errorInfo.message),
						__assign(
							{ errorType: mcpError.constructor.name },
							requestId && { requestId: requestId },
						),
					)
					jsonResponse = (0, errors_1.createJsonErrorResponse)(
						mcpError,
						requestId,
						{},
					)
					return [2 /*return*/, c.json(jsonResponse, errorInfo.status)]
				case 18:
					return [2 /*return*/]
			}
		})
	})
})
