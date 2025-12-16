'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.StateSchema = exports.ApprovedClientsSchema = void 0
var zod_1 = require('zod')
/**
 * Schema for validating the approved clients cookie content.
 * Ensures the cookie contains an array of string client IDs.
 */
exports.ApprovedClientsSchema = zod_1.z.array(zod_1.z.string())
/**
 * Schema for OAuth request information
 * Matches the AuthRequest interface from @cloudflare/workers-oauth-provider
 */
var AuthRequestSchema = zod_1.z.object({
	// Required fields
	responseType: zod_1.z.string(),
	clientId: zod_1.z.string(),
	redirectUri: zod_1.z.string(),
	scope: zod_1.z.array(zod_1.z.string()),
	state: zod_1.z.string(),
	// Optional fields
	codeChallenge: zod_1.z.string().optional(),
	codeChallengeMethod: zod_1.z.string().optional(),
})
/**
 * Schema for validating state data.
 * Includes common fields that may be present in the state object.
 */
exports.StateSchema = zod_1.z
	.object({
		clientId: zod_1.z.string().optional(),
		userId: zod_1.z.string().optional(),
		oauthReqInfo: AuthRequestSchema.optional(),
	})
	.passthrough()
