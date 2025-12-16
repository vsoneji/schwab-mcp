'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.getConfig = void 0
var zod_1 = require('zod')
var log_1 = require('../shared/log')
var envSchema = zod_1.z.object({
	SCHWAB_CLIENT_ID: zod_1.z
		.string({
			required_error: 'SCHWAB_CLIENT_ID is required for OAuth authentication',
		})
		.min(1, 'SCHWAB_CLIENT_ID cannot be empty'),
	SCHWAB_CLIENT_SECRET: zod_1.z
		.string({
			required_error:
				'SCHWAB_CLIENT_SECRET is required for OAuth authentication',
		})
		.min(1, 'SCHWAB_CLIENT_SECRET cannot be empty'),
	COOKIE_ENCRYPTION_KEY: zod_1.z
		.string({
			required_error:
				'COOKIE_ENCRYPTION_KEY is required for secure cookie storage',
		})
		.min(1, 'COOKIE_ENCRYPTION_KEY cannot be empty'),
	SCHWAB_REDIRECT_URI: zod_1.z
		.string({
			required_error: 'SCHWAB_REDIRECT_URI is required for OAuth callback',
		})
		.url('SCHWAB_REDIRECT_URI must be a valid URL'),
	OAUTH_KV: zod_1.z.any().refine(
		function (v) {
			return !!v
		},
		{
			message: 'OAUTH_KV binding is required for token storage',
		},
	),
	LOG_LEVEL: zod_1.z
		.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
		.optional()
		.default('info'),
	ENVIRONMENT: zod_1.z
		.enum(['development', 'staging', 'production'])
		.optional()
		.default('production'),
})
function buildConfigInternal(env) {
	try {
		var validated = envSchema.parse(env)
		return Object.freeze(validated)
	} catch (error) {
		if (error instanceof zod_1.z.ZodError) {
			var issues = error.issues
				.map(function (issue) {
					var path = issue.path.join('.')
					return '  - '.concat(path, ': ').concat(issue.message)
				})
				.join('\n')
			var msg = 'Environment validation failed:\n'.concat(issues)
			log_1.logger.error(msg)
			throw new Error(msg)
		}
		throw error
	}
}
// Memoized singleton config getter
exports.getConfig = (function () {
	var cachedConfig = null
	var cachedEnvHash = null
	return function (env) {
		// Create a simple hash of the env object for memoization
		// Exclude OAUTH_PROVIDER to avoid circular reference issues
		var envHash = JSON.stringify(
			Object.keys(env)
				.filter(function (key) {
					return key !== 'OAUTH_PROVIDER'
				}) // Exclude circular reference
				.sort()
				.map(function (key) {
					return [key, env[key]]
				}),
		)
		if (cachedConfig && cachedEnvHash === envHash) {
			return cachedConfig
		}
		cachedConfig = buildConfigInternal(env)
		cachedEnvHash = envHash
		return cachedConfig
	}
})()
