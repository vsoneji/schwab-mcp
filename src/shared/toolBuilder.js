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
exports.toolError = toolError
exports.toolSuccess = toolSuccess
exports.createTool = createTool
var zod_1 = require('zod')
var log_1 = require('./log')
var toolRegistry = new Map()
function isOk(res) {
	return res.ok
}
function formatResponse(response) {
	// Handle ToolResponse format
	if ('ok' in response) {
		if (isOk(response)) {
			var dataToLog = 'data' in response ? response.data : null
			var message =
				('message' in response && response.message) ||
				(dataToLog && dataToLog.message) ||
				'Operation successful'
			var content = [{ type: 'text', text: message }]
			// Only add data if it exists and isn't redundant with message
			if (dataToLog !== null && dataToLog !== undefined) {
				content.push({ type: 'text', text: JSON.stringify(dataToLog, null, 2) })
			}
			return { content: content }
		} else {
			var errorMessage = 'An error occurred'
			if ('error' in response && response.error) {
				errorMessage =
					response.error instanceof Error
						? response.error.message
						: String(response.error)
			}
			var content = [{ type: 'text', text: errorMessage }]
			if ('details' in response && response.details) {
				if (response.details.formattedDetails) {
					content.push({
						type: 'text',
						text: 'Details: '.concat(response.details.formattedDetails),
					})
				}
				var diagnosticInfo = {
					status: response.details.status,
					code: response.details.code,
					requestId: response.details.requestId,
				}
				if (
					Object.values(diagnosticInfo).some(function (val) {
						return val !== undefined
					})
				) {
					content.push({
						type: 'text',
						text: 'Diagnostic Info: '.concat(JSON.stringify(diagnosticInfo)),
					})
				}
			}
			return { content: content, isError: true }
		}
	}
	return {
		content: [{ type: 'text', text: JSON.stringify(response, null, 2) }],
	}
}
function isSchwabApiError(error) {
	var _a
	return (
		error &&
		typeof error === 'object' &&
		(error.name === 'SchwabApiError' ||
			((_a = error.constructor) === null || _a === void 0
				? void 0
				: _a.name) === 'SchwabApiError')
	)
}
function isAuthError(error) {
	var _a
	return (
		error &&
		typeof error === 'object' &&
		(error.name === 'SchwabAuthError' ||
			((_a = error.constructor) === null || _a === void 0
				? void 0
				: _a.name) === 'SchwabAuthError')
	)
}
function toolError(message, details) {
	var error = message instanceof Error ? message : new Error(String(message))
	var enhancedDetails = __assign({}, details)
	if (isSchwabApiError(error) || isAuthError(error)) {
		var apiError = error
		enhancedDetails = __assign(__assign({}, enhancedDetails), {
			status: apiError.status,
			code: apiError.code,
			parsedError: apiError.parsedError,
		})
		if (typeof apiError.getRequestId === 'function') {
			enhancedDetails.requestId = apiError.getRequestId()
		}
		if (typeof apiError.getFormattedDetails === 'function') {
			enhancedDetails.formattedDetails = apiError.getFormattedDetails()
		}
	}
	log_1.logger.error('Tool error', {
		message: error.message, // Log only message to avoid large objects in primary log
		details: enhancedDetails,
		stack: error.stack,
	})
	return { ok: false, error: error, details: enhancedDetails }
}
function toolSuccess(_a) {
	var data = _a.data,
		message = _a.message,
		source = _a.source
	var count = Array.isArray(data) ? data.length : 1
	log_1.logger.debug('Tool success: '.concat(source), {
		dataPreview: Array.isArray(data)
			? 'Array of '.concat(count, ' items')
			: typeof data,
		count: count,
	})
	return { ok: true, data: data, message: message }
}
function createTool(client, server, _a) {
	var _this = this
	var name = _a.name,
		description = _a.description,
		schema = _a.schema,
		handler = _a.handler
	// Populate the internal toolRegistry
	toolRegistry.set(name, { schema: schema, handler: handler })
	log_1.logger.info(
		"[ToolBuilder] Added tool '".concat(name, "' to internal toolRegistry."),
	)
	// Keep individual tool registration with McpServer for potential direct calls
	// or if the dispatcher logic is ever removed.
	log_1.logger.info(
		"[ToolBuilder] Registering tool with McpServer for direct call: '".concat(
			name,
			"'.",
		),
	)
	server.tool(
		name,
		description,
		schema instanceof zod_1.z.ZodObject ? schema.shape : {},
		function (args) {
			return __awaiter(_this, void 0, void 0, function () {
				var parsedInput, result, error_1
				return __generator(this, function (_a) {
					switch (_a.label) {
						case 0:
							_a.trys.push([0, 2, , 3])
							log_1.logger.info(
								'[ToolBuilder] Direct invocation of tool: '.concat(name),
							)
							parsedInput = void 0
							try {
								parsedInput = schema.parse(args)
							} catch (validationError) {
								log_1.logger.error(
									'Input validation error in direct tool: '.concat(name),
									{
										validationError:
											validationError instanceof Error
												? validationError.message
												: String(validationError),
										argsReceived: args,
									},
								)
								return [
									2 /*return*/,
									formatResponse(
										toolError('Invalid input for direct tool call.', {
											details:
												validationError instanceof Error
													? validationError.message
													: String(validationError),
										}),
									),
								]
							}
							return [4 /*yield*/, handler(parsedInput, client)]
						case 1:
							result = _a.sent()
							return [2 /*return*/, formatResponse(result)]
						case 2:
							error_1 = _a.sent()
							log_1.logger.error(
								'Unexpected error in direct tool: '.concat(name),
								{
									error:
										error_1 instanceof Error
											? error_1.message
											: String(error_1),
								},
							)
							return [
								2 /*return*/,
								formatResponse(
									toolError(
										error_1 instanceof Error
											? error_1
											: new Error('Unknown error in direct tool call'),
										{ source: name },
									),
								),
							]
						case 3:
							return [2 /*return*/]
					}
				})
			})
		},
	)
	// The log from `createTool` in the original plan was inside the `createTool` that takes `name, schema, handler`
	// The message "Registered tool with McpServer: '${name}' using schema definition." is a bit redundant now
	// as we have a more specific log above for direct call registration.
	// Let's stick to the specific logs for clarity.
}
