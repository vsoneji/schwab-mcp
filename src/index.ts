#!/usr/bin/env node
import 'dotenv/config'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
	ListToolsRequestSchema,
	CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import {
	createApiClient,
	type SchwabApiClient,
	type EnhancedTokenManager,
	type SchwabApiLogger,
	type TokenData,
} from '@sudowealth/schwab-api'
import { type ValidatedEnv, type Env } from '../types/env.js'
import { initializeSchwabAuthClient } from './auth/client.js'
import { getConfig } from './config/index.js'
import { startOAuthServer } from './server/oauth.js'
import {
	APP_NAME,
	LOGGER_CONTEXTS,
	TOOL_NAMES,
	ENVIRONMENTS,
	CONTENT_TYPES,
	APP_SERVER_NAME,
} from './shared/constants.js'
import {
	makeFileTokenStore,
	type TokenIdentifiers,
} from './shared/fileTokenStore.js'
import { logger, buildLogger, type PinoLogLevel } from './shared/log.js'
import { logOnlyInDevelopment } from './shared/secureLogger.js'
import { toolError, toolSuccess } from './shared/toolBuilder.js'
import { allToolSpecs, type ToolSpec } from './tools/index.js'

// Props for MCP server state
type MCPProps = {
	/** Schwab user ID when available (preferred for token key) */
	schwabUserId?: string
	/** OAuth client ID (fallback for token key) */
	clientId?: string
}

class SchwabMCPServer {
	private tokenManager!: EnhancedTokenManager
	private client!: SchwabApiClient
	private validatedConfig!: ValidatedEnv
	private props: MCPProps = {}
	private mcpLogger = logger.child(LOGGER_CONTEXTS.MCP_DO)

	server = new Server(
		{
			name: APP_NAME,
			version: '0.1.0',
		},
		{
			capabilities: {
				tools: {},
			},
		},
	)

	async init() {
		try {
			// Load environment from process.env
			const env: Env = {
				SCHWAB_CLIENT_ID: process.env.SCHWAB_CLIENT_ID!,
				SCHWAB_CLIENT_SECRET: process.env.SCHWAB_CLIENT_SECRET!,
				SCHWAB_REDIRECT_URI:
					process.env.SCHWAB_REDIRECT_URI || 'https://localhost:3000/callback',
				LOG_LEVEL: process.env.LOG_LEVEL,
				ENVIRONMENT: process.env.ENVIRONMENT,
				PORT: process.env.PORT ? parseInt(process.env.PORT) : undefined,
			}

			// Register a minimal tool synchronously to ensure tools are detected
			this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
				tools: [
					{
						name: TOOL_NAMES.STATUS,
						description: 'Check Schwab MCP server status',
						inputSchema: {
							type: 'object' as const,
							properties: {},
						},
					},
				],
			}))

			this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
				if (request.params.name === TOOL_NAMES.STATUS) {
					return {
						content: [
							{
								type: CONTENT_TYPES.TEXT,
								text: `${APP_SERVER_NAME} is running. Use tool discovery to see all available tools.`,
							},
						],
					}
				}
				throw new Error(`Unknown tool: ${request.params.name}`)
			})

			this.validatedConfig = getConfig(env)

			// Initialize logger with configured level
			const logLevel = this.validatedConfig.LOG_LEVEL as PinoLogLevel
			const newLogger = buildLogger(logLevel)
			// Replace the singleton logger instance
			Object.assign(logger, newLogger)
			const redirectUri = this.validatedConfig.SCHWAB_REDIRECT_URI

			this.mcpLogger.debug('[SchwabMCPServer.init] STEP 0: Start')
			this.mcpLogger.debug('[SchwabMCPServer.init] STEP 1: Env initialized.')

			// Create file token store - single source of truth
			const fileToken = makeFileTokenStore()

			// Ensure clientId is stored in props for token key derivation
			if (!this.props.clientId) {
				this.props.clientId = this.validatedConfig.SCHWAB_CLIENT_ID
			}

			const getTokenIds = (): TokenIdentifiers => ({
				schwabUserId: this.props.schwabUserId,
				clientId: this.props.clientId,
			})

			// Debug token IDs during initialization
			logOnlyInDevelopment(
				this.mcpLogger,
				'debug',
				'[SchwabMCPServer.init] Token identifiers',
				{
					hasSchwabUserId: !!this.props.schwabUserId,
					hasClientId: !!this.props.clientId,
					expectedKeyPrefix: fileToken.tokenKey(getTokenIds()).substring(0, 20),
				},
			)

			// Token save function uses file store exclusively
			const saveTokenForETM = async (tokenSet: TokenData) => {
				await fileToken.save(getTokenIds(), tokenSet)
				this.mcpLogger.debug('ETM: Token save to file complete', {
					keyPrefix: fileToken.tokenKey(getTokenIds()).substring(0, 20),
				})
			}

			// Token load function uses file store exclusively
			const loadTokenForETM = async (): Promise<TokenData | null> => {
				const tokenIds = getTokenIds()
				this.mcpLogger.debug('[ETM Load] Attempting to load token', {
					hasSchwabUserId: !!tokenIds.schwabUserId,
					hasClientId: !!tokenIds.clientId,
					expectedKeyPrefix: fileToken.tokenKey(tokenIds).substring(0, 20),
				})

				const tokenData = await fileToken.load(tokenIds)
				this.mcpLogger.debug('ETM: Token load from file complete', {
					keyPrefix: fileToken.tokenKey(tokenIds).substring(0, 20),
				})
				return tokenData
			}

			this.mcpLogger.debug(
				'[SchwabMCPServer.init] STEP 2: Storage and event handlers defined.',
			)

			// 1. Create ETM instance (synchronous)
			const hadExistingTokenManager = !!this.tokenManager
			this.mcpLogger.debug(
				'[SchwabMCPServer.init] STEP 3A: ETM instance setup',
				{
					hadExisting: hadExistingTokenManager,
				},
			)
			if (!this.tokenManager) {
				this.tokenManager = initializeSchwabAuthClient(
					this.validatedConfig,
					redirectUri,
					loadTokenForETM,
					saveTokenForETM,
				) // This is synchronous
			}
			this.mcpLogger.debug(
				'[SchwabMCPServer.init] STEP 3B: ETM instance ready',
				{
					wasReused: hadExistingTokenManager,
				},
			)

			const mcpLogger: SchwabApiLogger = {
				debug: (message: string, ...args: any[]) =>
					this.mcpLogger.debug(message, args.length > 0 ? args[0] : undefined),
				info: (message: string, ...args: any[]) =>
					this.mcpLogger.info(message, args.length > 0 ? args[0] : undefined),
				warn: (message: string, ...args: any[]) =>
					this.mcpLogger.warn(message, args.length > 0 ? args[0] : undefined),
				error: (message: string, ...args: any[]) =>
					this.mcpLogger.error(message, args.length > 0 ? args[0] : undefined),
			}
			this.mcpLogger.debug('[SchwabMCPServer.init] STEP 4: MCP Logger adapted.')

			// 2. Proactively initialize ETM to load tokens BEFORE creating client
			this.mcpLogger.debug(
				'[SchwabMCPServer.init] STEP 5A: Proactively calling this.tokenManager.initialize() (async)...',
			)
			const etmInitSuccess = this.tokenManager.initialize()
			this.mcpLogger.debug(
				`[SchwabMCPServer.init] STEP 5B: Proactive ETM initialization complete. Success: ${etmInitSuccess}`,
			)

			// Check if we have tokens, if not, start OAuth flow
			const hasToken = await loadTokenForETM()
			if (!hasToken) {
				this.mcpLogger.info('No existing tokens found, starting OAuth flow...')

				// Start OAuth server and wait for authentication
				const userData = await startOAuthServer(
					this.validatedConfig,
					this.tokenManager,
					fileToken,
				)

				// Update props with schwabUserId
				this.props.schwabUserId = userData.schwabUserId
				this.props.clientId = this.validatedConfig.SCHWAB_CLIENT_ID

				this.mcpLogger.info('OAuth flow completed successfully')
			} else {
				this.mcpLogger.info('Existing tokens found, skipping OAuth flow')
			}

			// 2.5. Auto-migrate tokens if we have schwabUserId but token was loaded from clientId key
			if (this.props.schwabUserId && this.props.clientId) {
				await fileToken.migrateIfNeeded(
					{ clientId: this.props.clientId },
					{ schwabUserId: this.props.schwabUserId },
				)
				this.mcpLogger.debug(
					'[SchwabMCPServer.init] STEP 5C: Token migration completed',
				)
			}

			// 3. Create SchwabApiClient AFTER tokens are loaded
			this.client = createApiClient({
				config: {
					environment: ENVIRONMENTS.PRODUCTION,
					logger: mcpLogger,
					enableLogging: true,
					logLevel:
						this.validatedConfig.ENVIRONMENT === 'production'
							? 'error'
							: 'debug',
				},
				auth: this.tokenManager,
			})
			this.mcpLogger.debug(
				'[SchwabMCPServer.init] STEP 6: SchwabApiClient ready.',
			)

			// 4. Register tools
			this.mcpLogger.debug(
				'[SchwabMCPServer.init] STEP 7A: Calling registerTools...',
			)
			this.registerTools()
			this.mcpLogger.debug(
				'[SchwabMCPServer.init] STEP 7B: registerTools completed.',
			)
			this.mcpLogger.debug(
				'[SchwabMCPServer.init] STEP 8: SchwabMCPServer.init FINISHED SUCCESSFULLY',
			)
		} catch (error: any) {
			this.mcpLogger.error(
				'[SchwabMCPServer.init] FINAL CATCH: UNHANDLED EXCEPTION in init()',
				{
					error: error.message,
					stack: error.stack,
				},
			)
			throw error
		}
	}

	private registerTools() {
		// Register all tool specs
		const tools = allToolSpecs.map((spec: ToolSpec<any>) => ({
			name: spec.name,
			description: spec.description,
			inputSchema: spec.schema,
		}))

		this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
			tools,
		}))

		this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
			const toolName = request.params.name
			const params = request.params.arguments || {}

			const spec = allToolSpecs.find((s) => s.name === toolName)
			if (!spec) {
				throw new Error(`Unknown tool: ${toolName}`)
			}

			try {
				const data = await spec.call(this.client, params)
				return toolSuccess({
					data,
					source: spec.name,
					message: `Successfully executed ${spec.name}`,
				})
			} catch (error) {
				return toolError(error, { source: spec.name })
			}
		})
	}

	async run() {
		await this.init()

		const transport = new StdioServerTransport()
		await this.server.connect(transport)

		this.mcpLogger.info('Schwab MCP server running on stdio')
	}
}

// Main entry point
const server = new SchwabMCPServer()
server.run().catch((error) => {
	console.error('Fatal error:', error)
	process.exit(1)
})
