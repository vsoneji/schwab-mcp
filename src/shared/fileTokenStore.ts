import { promises as fs } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { type TokenData } from '@sudowealth/schwab-api'
import { logger } from './log.js'
import { LOGGER_CONTEXTS } from './constants.js'

const storeLogger = logger.child(LOGGER_CONTEXTS.TOKEN_STORE)

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const TOKEN_DIR = join(__dirname, '../../.auth')
const TOKEN_FILE = join(TOKEN_DIR, 'tokens.json')

/**
 * Token identifiers for determining storage key
 * Prefer schwabUserId when available, fall back to clientId
 */
export type TokenIdentifiers = {
	schwabUserId?: string
	clientId?: string
}

/**
 * File-based token store interface
 */
export interface FileTokenStore {
	/**
	 * Save token data to file storage
	 */
	save: (ids: TokenIdentifiers, tokenData: TokenData) => Promise<void>

	/**
	 * Load token data from file storage
	 */
	load: (ids: TokenIdentifiers) => Promise<TokenData | null>

	/**
	 * Migrate token from old key to new key
	 */
	migrateIfNeeded: (
		oldIds: TokenIdentifiers,
		newIds: TokenIdentifiers,
	) => Promise<void>

	/**
	 * Get the key for a token
	 */
	tokenKey: (ids: TokenIdentifiers) => string
}

/**
 * Ensure the token directory exists
 */
async function ensureTokenDir(): Promise<void> {
	try {
		await fs.mkdir(TOKEN_DIR, { recursive: true })
	} catch (error) {
		storeLogger.error('Failed to create token directory', { error })
		throw error
	}
}

/**
 * Read all tokens from file
 */
async function readTokens(): Promise<Record<string, TokenData>> {
	try {
		await ensureTokenDir()
		const data = await fs.readFile(TOKEN_FILE, 'utf-8')
		return JSON.parse(data)
	} catch (error: any) {
		if (error.code === 'ENOENT') {
			// File doesn't exist yet
			return {}
		}
		storeLogger.error('Failed to read tokens file', { error })
		return {}
	}
}

/**
 * Write all tokens to file
 */
async function writeTokens(
	tokens: Record<string, TokenData>,
): Promise<void> {
	try {
		await ensureTokenDir()
		await fs.writeFile(TOKEN_FILE, JSON.stringify(tokens, null, 2), 'utf-8')
	} catch (error) {
		storeLogger.error('Failed to write tokens file', { error })
		throw error
	}
}

/**
 * Create a file-based token store
 */
export function makeFileTokenStore(): FileTokenStore {
	const tokenKey = (ids: TokenIdentifiers): string => {
		if (ids.schwabUserId) {
			return `schwab:${ids.schwabUserId}`
		}
		if (ids.clientId) {
			return `client:${ids.clientId}`
		}
		throw new Error('Either schwabUserId or clientId must be provided')
	}

	return {
		tokenKey,

		save: async (ids: TokenIdentifiers, tokenData: TokenData) => {
			const key = tokenKey(ids)
			storeLogger.debug('Saving token to file storage', {
				key: key.substring(0, 20) + '...',
			})

			const tokens = await readTokens()
			tokens[key] = tokenData
			await writeTokens(tokens)

			storeLogger.debug('Token saved to file storage', {
				key: key.substring(0, 20) + '...',
			})
		},

		load: async (ids: TokenIdentifiers): Promise<TokenData | null> => {
			const key = tokenKey(ids)
			storeLogger.debug('Loading token from file storage', {
				key: key.substring(0, 20) + '...',
			})

			const tokens = await readTokens()
			const tokenData = tokens[key] || null

			if (tokenData) {
				storeLogger.debug('Token loaded from file storage', {
					key: key.substring(0, 20) + '...',
				})
			} else {
				storeLogger.debug('No token found in file storage', {
					key: key.substring(0, 20) + '...',
				})
			}

			return tokenData
		},

		migrateIfNeeded: async (
			oldIds: TokenIdentifiers,
			newIds: TokenIdentifiers,
		) => {
			const oldKey = tokenKey(oldIds)
			const newKey = tokenKey(newIds)

			if (oldKey === newKey) {
				storeLogger.debug('Token migration not needed, keys are identical')
				return
			}

			storeLogger.info('Attempting token migration', {
				oldKey: oldKey.substring(0, 20) + '...',
				newKey: newKey.substring(0, 20) + '...',
			})

			const tokens = await readTokens()
			const oldToken = tokens[oldKey]
			const newToken = tokens[newKey]

			if (oldToken && !newToken) {
				// Migrate from old to new
				tokens[newKey] = oldToken
				delete tokens[oldKey]
				await writeTokens(tokens)
				storeLogger.info('Token migration complete', {
					oldKey: oldKey.substring(0, 20) + '...',
					newKey: newKey.substring(0, 20) + '...',
				})
			} else if (newToken) {
				storeLogger.debug('Token already exists at new key, no migration needed')
			} else {
				storeLogger.debug('No token at old key to migrate')
			}
		},
	}
}
