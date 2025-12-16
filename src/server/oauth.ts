import { promises as fs } from 'node:fs'
import https from 'node:https'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
	createApiClient,
	type EnhancedTokenManager,
} from '@sudowealth/schwab-api'
import express, { type Request, type Response } from 'express'
import open from 'open'
import { type ValidatedEnv } from '../../types/env.js'
import { LOGGER_CONTEXTS } from '../shared/constants.js'
import { type FileTokenStore } from '../shared/fileTokenStore.js'
import { logger } from '../shared/log.js'
import { generateCertificates } from './certificates.js'

const oauthLogger = logger.child(LOGGER_CONTEXTS.OAUTH_HANDLER)

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const CERT_DIR = join(__dirname, '../../.certs')

export interface OAuthResult {
	schwabUserId: string
	clientId: string
}

/**
 * Start the OAuth server and handle the authentication flow
 */
export async function startOAuthServer(
	config: ValidatedEnv,
	tokenManager: EnhancedTokenManager,
	fileTokenStore: FileTokenStore,
): Promise<OAuthResult> {
	return new Promise(async (resolve, reject) => {
		const app = express()
		const port = config.PORT

		// Ensure certificates exist
		await generateCertificates()

		// Load certificates
		const certPath = join(CERT_DIR, 'cert.pem')
		const keyPath = join(CERT_DIR, 'key.pem')

		let credentials: { key: Buffer; cert: Buffer }
		try {
			const [key, cert] = await Promise.all([
				fs.readFile(keyPath),
				fs.readFile(certPath),
			])
			credentials = { key, cert }
		} catch (error) {
			oauthLogger.error('Failed to load certificates', { error })
			reject(error)
			return
		}

		// Callback endpoint
		app.get('/callback', async (req: Request, res: Response) => {
			try {
				const code = req.query.code as string
				const state = req.query.state as string

				if (!code || !state) {
					oauthLogger.error('Missing code or state in callback')
					res.status(400).send('Missing code or state parameter')
					return
				}

				oauthLogger.info('OAuth callback received, exchanging code for tokens')

				// Exchange the code for tokens
				try {
					await tokenManager.exchangeCode(code, state)
				} catch (error: any) {
					oauthLogger.error('Token exchange failed', {
						error: error.message,
					})
					res.status(500).send('Token exchange failed: ' + error.message)
					return
				}

				oauthLogger.info('Token exchange successful')

				// Create API client to get user info
				const client = createApiClient({
					config: { environment: 'PRODUCTION' },
					auth: tokenManager,
				})

				// Fetch user preferences to get Schwab user ID
				oauthLogger.info('Fetching user preferences to get Schwab user ID')
				let userPreferences
				try {
					userPreferences =
						await client.trader.userPreference.getUserPreference()
				} catch (error: any) {
					oauthLogger.error('Failed to fetch user preferences', {
						error: error.message,
					})
					res.status(500).send('Failed to fetch user info: ' + error.message)
					return
				}

				const schwabUserId =
					userPreferences?.streamerInfo?.[0]?.schwabClientCorrelId

				if (!schwabUserId) {
					oauthLogger.error('Failed to get Schwab user ID from preferences')
					res.status(500).send('Failed to get Schwab user ID')
					return
				}

				// Migrate token from clientId-based key to schwabUserId-based key
				const clientId = config.SCHWAB_CLIENT_ID
				try {
					const currentTokenData = await fileTokenStore.load({ clientId })
					if (currentTokenData) {
						await fileTokenStore.save({ schwabUserId }, currentTokenData)
						oauthLogger.info('Token migrated to schwabUserId key')
					}
				} catch (error: any) {
					oauthLogger.warn('Token migration failed, continuing', {
						error: error.message,
					})
				}

				oauthLogger.info('OAuth flow completed successfully', {
					schwabUserId: schwabUserId.substring(0, 8) + '...',
				})

				res.send(`
					<html>
						<head>
							<title>Authentication Successful</title>
							<style>
								body {
									font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
									display: flex;
									justify-content: center;
									align-items: center;
									height: 100vh;
									margin: 0;
									background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
								}
								.container {
									background: white;
									padding: 40px;
									border-radius: 10px;
									box-shadow: 0 10px 25px rgba(0,0,0,0.2);
									text-align: center;
									max-width: 500px;
								}
								h1 {
									color: #4CAF50;
									margin-bottom: 20px;
								}
								p {
									color: #666;
									line-height: 1.6;
								}
								.success-icon {
									font-size: 64px;
									margin-bottom: 20px;
								}
							</style>
						</head>
						<body>
							<div class="container">
								<div class="success-icon">✓</div>
								<h1>Authentication Successful!</h1>
								<p>You have successfully authenticated with Schwab.</p>
								<p>You can close this window and return to the terminal.</p>
							</div>
						</body>
					</html>
				`)

				// Shutdown server after successful authentication
				setTimeout(() => {
					server.close(() => {
						oauthLogger.info('OAuth server shut down')
						resolve({
							schwabUserId,
							clientId,
						})
					})
				}, 1000)
			} catch (error: any) {
				oauthLogger.error('Error in OAuth callback', {
					error: error.message,
				})
				res.status(500).send('Internal server error: ' + error.message)
			}
		})

		// Health check endpoint
		app.get('/health', (req: Request, res: Response) => {
			res.json({ status: 'ok' })
		})

		// Start HTTPS server
		const server = https.createServer(credentials, app)

		server.listen(port, async () => {
			oauthLogger.info(`OAuth server listening on https://localhost:${port}`)

			// Generate authorization URL
			const authUrl = await tokenManager.getAuthorizationUrl()

			oauthLogger.info('Please visit this URL to authorize the application:')
			console.log(`\n${authUrl}\n`)
			console.log('Opening browser automatically...\n')

			// Open browser automatically
			try {
				await open(authUrl)
			} catch (error) {
				oauthLogger.warn('Failed to open browser automatically', { error })
				console.log('Please open the URL manually in your browser.')
			}
		})

		server.on('error', (error) => {
			oauthLogger.error('OAuth server error', { error })
			reject(error)
		})
	})
}
