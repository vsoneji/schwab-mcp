'use strict'
/**
 * Lightweight Pino logger wrapper for Cloudflare Workers
 * Provides structured logging with automatic secret redaction
 */
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
Object.defineProperty(exports, '__esModule', { value: true })
exports.logger = void 0
exports.buildLogger = buildLogger
var pino_1 = require('pino')
// Redaction paths for sensitive data
var REDACT_PATHS = [
	'password',
	'secret',
	'token',
	'key',
	'auth',
	'authorization',
	'cookie',
	'session',
	'accessToken',
	'refreshToken',
	'api_key',
	'apiKey',
	'client_secret',
	'clientSecret',
	'schwabUserId',
	'clientId',
	'accountNumber',
	'hashValue',
	'schwabClientCorrelId',
	'sourceKey',
	'expectedKey',
	'tokenKey',
	'fromKey',
	'toKey',
	'*.password',
	'*.secret',
	'*.token',
	'*.key',
	'*.auth',
	'*.authorization',
	'*.cookie',
	'*.session',
	'*.accessToken',
	'*.refreshToken',
	'*.api_key',
	'*.apiKey',
	'*.client_secret',
	'*.clientSecret',
	'*.schwabUserId',
	'*.clientId',
	'*.accountNumber',
	'*.hashValue',
	'*.schwabClientCorrelId',
	'*.sourceKey',
	'*.expectedKey',
	'*.tokenKey',
	'*.fromKey',
	'*.toKey',
]
// Custom serializers for additional redaction
var serializers = {
	// Redact authorization headers
	req: function (req) {
		var _a, _b
		var serialized = pino_1.default.stdSerializers.req(req)
		if (
			(_a = serialized.headers) === null || _a === void 0
				? void 0
				: _a.authorization
		) {
			serialized.headers.authorization = '[REDACTED]'
		}
		if (
			(_b = serialized.headers) === null || _b === void 0 ? void 0 : _b.cookie
		) {
			serialized.headers.cookie = '[REDACTED]'
		}
		return serialized
	},
	// Redact sensitive error properties
	err: function (err) {
		var serialized = pino_1.default.stdSerializers.err(err)
		// Add any custom error redaction here if needed
		return serialized
	},
}
// Pino configuration for Cloudflare Workers
var pinoConfig = {
	// Use browser transport for console output in Workers
	browser: {
		asObject: false,
		serialize: true,
	},
	// Set redaction paths
	redact: {
		paths: REDACT_PATHS,
		censor: '[REDACTED]',
	},
	// Custom serializers
	serializers: serializers,
	// Format timestamps
	timestamp: pino_1.default.stdTimeFunctions.isoTime,
	// Base context
	base: {
		env: 'cloudflare-worker',
	},
}
/**
 * Build a logger instance with the specified log level
 */
function buildLogger(level) {
	if (level === void 0) {
		level = 'info'
	}
	// Create base pino instance
	var baseLogger = (0, pino_1.default)(
		__assign(__assign({}, pinoConfig), { level: level }),
	)
	// Create wrapper that matches our existing interface
	var createLogFunction = function (logFn) {
		return function (message, data, contextId) {
			if (contextId) {
				logFn(__assign({ contextId: contextId }, data), message)
			} else if (data !== undefined) {
				logFn(data, message)
			} else {
				logFn(message)
			}
		}
	}
	var logger = {
		debug: createLogFunction(baseLogger.debug.bind(baseLogger)),
		info: createLogFunction(baseLogger.info.bind(baseLogger)),
		warn: createLogFunction(baseLogger.warn.bind(baseLogger)),
		error: createLogFunction(baseLogger.error.bind(baseLogger)),
		child: function (contextId) {
			var childLogger = baseLogger.child({ contextId: contextId })
			var createChildLogFunction = function (logFn) {
				return function (message, data, additionalContextId) {
					if (additionalContextId) {
						logFn(__assign({ contextId: additionalContextId }, data), message)
					} else if (data !== undefined) {
						logFn(data, message)
					} else {
						logFn(message)
					}
				}
			}
			return {
				debug: createChildLogFunction(childLogger.debug.bind(childLogger)),
				info: createChildLogFunction(childLogger.info.bind(childLogger)),
				warn: createChildLogFunction(childLogger.warn.bind(childLogger)),
				error: createChildLogFunction(childLogger.error.bind(childLogger)),
			}
		},
	}
	return logger
}
// Create singleton logger instance with default level
// This will be reconfigured in MyMCP.init() with the actual level from config
exports.logger = buildLogger('info')
