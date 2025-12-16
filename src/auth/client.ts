import {
	createSchwabAuth as SchwabAuthCreatorFromLibrary,
	AuthStrategy,
	type TokenData,
	type EnhancedTokenManager,
	type EnhancedTokenManagerOptions,
} from '@sudowealth/schwab-api'
import { type ValidatedEnv } from '../../types/env.js.js'
import { LOGGER_CONTEXTS } from '../shared/constants.js.js'
import { logger } from '../shared/log.js.js'
import { mapTokenPersistence } from './tokenPersistence.js'

// Create scoped logger for auth client
const authLogger = logger.child(LOGGER_CONTEXTS.AUTH_CLIENT)

/**
 * Creates a Schwab Auth client with enhanced features
 *
 * @param redirectUri OAuth callback URI
 * @param load Function to load tokens from storage
 * @param save Function to save tokens to storage
 * @returns Initialized Schwab auth client as EnhancedTokenManager
 */
export function initializeSchwabAuthClient(
	config: ValidatedEnv,
	redirectUri = config.SCHWAB_REDIRECT_URI,
	load?: () => Promise<TokenData | null>,
	save?: (tokenData: TokenData) => Promise<void>,
): EnhancedTokenManager {
	const clientId = config.SCHWAB_CLIENT_ID
	const clientSecret = config.SCHWAB_CLIENT_SECRET

	authLogger.debug('Using centralized environment for Schwab Auth client')

	authLogger.info('Initializing enhanced Schwab Auth client', {
		hasLoadFunction: !!load,
		hasSaveFunction: !!save,
	})

	// Map our load/save functions to what EnhancedTokenManager expects
	const { load: mappedLoad, save: mappedSave } = mapTokenPersistence(load, save)

	// Build options for EnhancedTokenManager with MCP-specific defaults
	const tokenManagerOptions: EnhancedTokenManagerOptions = {
		clientId,
		clientSecret,
		redirectUri,
		load: mappedLoad,
		save: mappedSave,
		validateTokens: true,
		autoReconnect: true,
		debug: config.LOG_LEVEL === 'debug' || config.LOG_LEVEL === 'trace',
		traceOperations: config.LOG_LEVEL === 'trace',
		refreshThresholdMs: 5 * 60 * 1000,
	}

	// Configure auth with enhanced token manager
	const authConfig = {
		strategy: AuthStrategy.ENHANCED,
		oauthConfig: tokenManagerOptions,
	}

	const authClient = SchwabAuthCreatorFromLibrary(authConfig)
	return authClient
}


