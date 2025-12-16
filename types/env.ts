/**
 * Environment variables for the Schwab MCP server
 *
 * This is the single source of truth for environment variable definitions.
 * In runtime, these variables are validated and accessed through AppConfig.
 */
export interface Env {
	/**
	 * Schwab OAuth client ID for API access
	 */
	SCHWAB_CLIENT_ID: string

	/**
	 * Schwab OAuth client secret for API access
	 */
	SCHWAB_CLIENT_SECRET: string

	/**
	 * OAuth redirect URI for callback after authentication
	 * This should be https://localhost:3000/callback for local development
	 */
	SCHWAB_REDIRECT_URI: string

	/**
	 * Optional log level for application logging
	 */
	LOG_LEVEL?: string

	/**
	 * Environment type (development, staging, production)
	 * Defaults to production if not specified
	 */
	ENVIRONMENT?: string

	/**
	 * Port for HTTPS server (defaults to 3000)
	 */
	PORT?: number
}

/**
 * A validated Env object, with all required fields validated to be non-empty
 * Used to pass around a validated set of environment variables
 * All properties are readonly to prevent accidental modification after validation
 */
export interface ValidatedEnv {
	/**
	 * Schwab OAuth client ID for API access
	 */
	readonly SCHWAB_CLIENT_ID: string

	/**
	 * Schwab OAuth client secret for API access
	 */
	readonly SCHWAB_CLIENT_SECRET: string

	/**
	 * OAuth redirect URI for callback after authentication
	 */
	readonly SCHWAB_REDIRECT_URI: string

	/**
	 * Optional log level for application logging
	 */
	readonly LOG_LEVEL?: string

	/**
	 * Environment type (development, staging, production)
	 * Defaults to production if not specified
	 */
	readonly ENVIRONMENT?: 'development' | 'staging' | 'production'

	/**
	 * Port for HTTPS server
	 */
	readonly PORT: number
}
