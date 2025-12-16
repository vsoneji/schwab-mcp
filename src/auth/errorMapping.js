'use strict'
var _a
Object.defineProperty(exports, '__esModule', { value: true })
exports.mapSchwabError = mapSchwabError
var schwab_api_1 = require('@sudowealth/schwab-api')
var errors_1 = require('./errors')
// Create custom MCP error mapper
var MCPErrorMapper = /** @class */ (function () {
	function MCPErrorMapper() {}
	MCPErrorMapper.prototype.map = function (error) {
		// Handle MCP-specific errors
		if (error instanceof errors_1.AuthErrors.MissingClientId) {
			return {
				code: schwab_api_1.AuthErrorCode.INVALID_CONFIGURATION,
				message: 'Client ID is required',
				httpStatus: 400,
				isRetryable: false,
				requiresReauth: false,
			}
		}
		if (error instanceof errors_1.AuthErrors.CookieSecretMissing) {
			return {
				code: schwab_api_1.AuthErrorCode.INVALID_CONFIGURATION,
				message: 'Cookie encryption key is not configured',
				httpStatus: 500,
				isRetryable: false,
				requiresReauth: false,
			}
		}
		// Return null to let default mapper handle it
		return null
	}
	return MCPErrorMapper
})()
// Create instance with MCP-specific mappings
var errorMapper = new schwab_api_1.SchwabErrorMapper({
	customMappers: [new MCPErrorMapper()],
	customAuthMappings:
		((_a = {}),
		// Override specific mappings for MCP context
		(_a[schwab_api_1.AuthErrorCode.TOKEN_PERSISTENCE_LOAD_FAILED] = {
			message: 'Failed to load tokens from KV storage',
			httpStatus: 503,
			isRetryable: true,
		}),
		(_a[schwab_api_1.AuthErrorCode.TOKEN_PERSISTENCE_SAVE_FAILED] = {
			message: 'Failed to save tokens to KV storage',
			httpStatus: 503,
			isRetryable: true,
		}),
		_a),
})
/**
 * Maps a Schwab SDK error to the appropriate MCP error and metadata
 * Now uses the enhanced SDK error mapper
 */
function mapSchwabError(code, originalMessage, schwabStatus) {
	var _a
	// Create a mock error object for the mapper
	var mockError = {
		code: code,
		message: originalMessage,
		status: schwabStatus,
		isRetryable: function () {
			return false
		},
	}
	var mapping = errorMapper.map(mockError)
	// Map the SDK error code to MCP error class
	var mcpErrorMap =
		((_a = {}),
		(_a[schwab_api_1.AuthErrorCode.INVALID_CODE] = function () {
			return new errors_1.AuthErrors.TokenExchange()
		}),
		(_a[schwab_api_1.AuthErrorCode.PKCE_VERIFIER_MISSING] = function () {
			return new errors_1.AuthErrors.TokenExchange()
		}),
		(_a[schwab_api_1.AuthErrorCode.TOKEN_EXPIRED] = function () {
			return new errors_1.AuthErrors.TokenExchange()
		}),
		(_a[schwab_api_1.AuthErrorCode.UNAUTHORIZED] = function () {
			return new errors_1.AuthErrors.TokenExchange()
		}),
		(_a[schwab_api_1.AuthErrorCode.TOKEN_PERSISTENCE_LOAD_FAILED] =
			function () {
				return new errors_1.AuthErrors.AuthCallback()
			}),
		(_a[schwab_api_1.AuthErrorCode.TOKEN_PERSISTENCE_SAVE_FAILED] =
			function () {
				return new errors_1.AuthErrors.AuthCallback()
			}),
		(_a[schwab_api_1.AuthErrorCode.TOKEN_VALIDATION_ERROR] = function () {
			return new errors_1.AuthErrors.AuthCallback()
		}),
		(_a[schwab_api_1.AuthErrorCode.TOKEN_ENDPOINT_CONFIG_ERROR] = function () {
			return new errors_1.AuthErrors.AuthCallback()
		}),
		(_a[schwab_api_1.AuthErrorCode.REFRESH_NEEDED] = function () {
			return new errors_1.AuthErrors.ApiResponse()
		}),
		(_a[schwab_api_1.AuthErrorCode.NETWORK] = function () {
			return new errors_1.AuthErrors.ApiResponse()
		}),
		(_a[schwab_api_1.AuthErrorCode.UNKNOWN] = function () {
			return new errors_1.AuthErrors.AuthCallback()
		}),
		_a)
	var mcpErrorFactory =
		mcpErrorMap[code] ||
		function () {
			return new errors_1.AuthErrors.AuthCallback()
		}
	return {
		mcpError: mcpErrorFactory(),
		detailMessage: mapping.message,
		httpStatus: mapping.httpStatus,
	}
}
