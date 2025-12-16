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
exports.toolSpecs = void 0
var schwab_api_1 = require('@sudowealth/schwab-api')
var log_1 = require('../../shared/log')
var types_1 = require('../types')
exports.toolSpecs = [
	(0, types_1.createToolSpec)({
		name: 'getAccounts',
		description: 'Get accounts',
		schema: schwab_api_1.GetAccountsParams,
		call: function (c, p) {
			return __awaiter(void 0, void 0, void 0, function () {
				var accounts, accountSummaries, displayMap
				return __generator(this, function (_a) {
					switch (_a.label) {
						case 0:
							log_1.logger.info('[getAccounts] Fetching accounts', {
								showPositions: p === null || p === void 0 ? void 0 : p.fields,
							})
							return [
								4 /*yield*/,
								c.trader.accounts.getAccounts({
									queryParams: {
										fields: p === null || p === void 0 ? void 0 : p.fields,
									},
								}),
							]
						case 1:
							accounts = _a.sent()
							accountSummaries = accounts.map(function (acc) {
								return __assign({}, acc.securitiesAccount)
							})
							return [4 /*yield*/, (0, schwab_api_1.buildAccountDisplayMap)(c)]
						case 2:
							displayMap = _a.sent()
							return [
								2 /*return*/,
								(0, schwab_api_1.scrubAccountIdentifiers)(
									accountSummaries,
									displayMap,
								),
							]
					}
				})
			})
		},
	}),
	(0, types_1.createToolSpec)({
		name: 'getAccountNumbers',
		description: 'Get account numbers',
		schema: schwab_api_1.GetAccountNumbersParams,
		call: function (c, p) {
			return __awaiter(void 0, void 0, void 0, function () {
				var accounts, displayMap
				return __generator(this, function (_a) {
					switch (_a.label) {
						case 0:
							log_1.logger.info('[getAccountNumbers] Fetching account numbers')
							return [4 /*yield*/, c.trader.accounts.getAccountNumbers(p)]
						case 1:
							accounts = _a.sent()
							return [4 /*yield*/, (0, schwab_api_1.buildAccountDisplayMap)(c)]
						case 2:
							displayMap = _a.sent()
							return [
								2 /*return*/,
								accounts.map(function (acc) {
									return {
										accountDisplay: displayMap[acc.accountNumber],
										hashValue: acc.hashValue,
									}
								}),
							]
					}
				})
			})
		},
	}),
	(0, types_1.createToolSpec)({
		name: 'getAccount',
		description: 'Get account',
		schema: schwab_api_1.GetAccountByNumberParams,
		call: function (c, p) {
			return __awaiter(void 0, void 0, void 0, function () {
				var account, displayMap
				return __generator(this, function (_a) {
					switch (_a.label) {
						case 0:
							return [
								4 /*yield*/,
								c.trader.accounts.getAccountByNumber({
									pathParams: { accountNumber: p.accountNumber },
								}),
							]
						case 1:
							account = _a.sent()
							return [4 /*yield*/, (0, schwab_api_1.buildAccountDisplayMap)(c)]
						case 2:
							displayMap = _a.sent()
							return [
								2 /*return*/,
								(0, schwab_api_1.scrubAccountIdentifiers)(account, displayMap),
							]
					}
				})
			})
		},
	}),
	(0, types_1.createToolSpec)({
		name: 'getOrders',
		description: 'Get orders',
		schema: schwab_api_1.GetOrdersParams,
		call: function (c, p) {
			return __awaiter(void 0, void 0, void 0, function () {
				var orders, displayMap
				return __generator(this, function (_a) {
					switch (_a.label) {
						case 0:
							log_1.logger.info('[getOrders] Fetching orders', {
								maxResults: p.maxResults,
								hasDateFilter: !!p.fromEnteredTime || !!p.toEnteredTime,
							})
							return [
								4 /*yield*/,
								c.trader.orders.getOrders({ queryParams: p }),
							]
						case 1:
							orders = _a.sent()
							return [4 /*yield*/, (0, schwab_api_1.buildAccountDisplayMap)(c)]
						case 2:
							displayMap = _a.sent()
							return [
								2 /*return*/,
								(0, schwab_api_1.scrubAccountIdentifiers)(orders, displayMap),
							]
					}
				})
			})
		},
	}),
	(0, types_1.createToolSpec)({
		name: 'getOrdersByAccountNumber',
		description: 'Get orders by account number',
		schema: schwab_api_1.GetOrdersByAccountParams,
		call: function (c, p) {
			return __awaiter(void 0, void 0, void 0, function () {
				var orders, displayMap
				return __generator(this, function (_a) {
					switch (_a.label) {
						case 0:
							return [
								4 /*yield*/,
								c.trader.orders.getOrdersByAccount({
									pathParams: { accountNumber: p.accountNumber },
									queryParams: p,
								}),
							]
						case 1:
							orders = _a.sent()
							return [4 /*yield*/, (0, schwab_api_1.buildAccountDisplayMap)(c)]
						case 2:
							displayMap = _a.sent()
							return [
								2 /*return*/,
								(0, schwab_api_1.scrubAccountIdentifiers)(orders, displayMap),
							]
					}
				})
			})
		},
	}),
	(0, types_1.createToolSpec)({
		name: 'placeOrder',
		description: 'Place order for a specific account',
		schema: schwab_api_1.PlaceOrderParams,
		call: function (c, p) {
			return __awaiter(void 0, void 0, void 0, function () {
				var order, displayMap
				return __generator(this, function (_a) {
					switch (_a.label) {
						case 0:
							return [
								4 /*yield*/,
								c.trader.orders.placeOrderForAccount({
									pathParams: { accountNumber: p.accountNumber },
									body: p,
								}),
							]
						case 1:
							order = _a.sent()
							return [4 /*yield*/, (0, schwab_api_1.buildAccountDisplayMap)(c)]
						case 2:
							displayMap = _a.sent()
							return [
								2 /*return*/,
								(0, schwab_api_1.scrubAccountIdentifiers)(order, displayMap),
							]
					}
				})
			})
		},
	}),
	(0, types_1.createToolSpec)({
		name: 'getOrder',
		description: 'Get order by order id for a specific account',
		schema: schwab_api_1.GetOrderByIdParams,
		call: function (c, p) {
			return __awaiter(void 0, void 0, void 0, function () {
				var order, displayMap
				return __generator(this, function (_a) {
					switch (_a.label) {
						case 0:
							return [
								4 /*yield*/,
								c.trader.orders.getOrderByOrderId({
									pathParams: {
										accountNumber: p.accountNumber,
										orderId: p.orderId,
									},
								}),
							]
						case 1:
							order = _a.sent()
							return [4 /*yield*/, (0, schwab_api_1.buildAccountDisplayMap)(c)]
						case 2:
							displayMap = _a.sent()
							return [
								2 /*return*/,
								(0, schwab_api_1.scrubAccountIdentifiers)(order, displayMap),
							]
					}
				})
			})
		},
	}),
	(0, types_1.createToolSpec)({
		name: 'cancelOrder',
		description: 'Cancel order by order id for a specific account',
		schema: schwab_api_1.CancelOrderParams,
		call: function (c, p) {
			return __awaiter(void 0, void 0, void 0, function () {
				var order, displayMap
				return __generator(this, function (_a) {
					switch (_a.label) {
						case 0:
							return [
								4 /*yield*/,
								c.trader.orders.cancelOrder({
									pathParams: {
										accountNumber: p.accountNumber,
										orderId: p.orderId,
									},
								}),
							]
						case 1:
							order = _a.sent()
							return [4 /*yield*/, (0, schwab_api_1.buildAccountDisplayMap)(c)]
						case 2:
							displayMap = _a.sent()
							return [
								2 /*return*/,
								(0, schwab_api_1.scrubAccountIdentifiers)(order, displayMap),
							]
					}
				})
			})
		},
	}),
	(0, types_1.createToolSpec)({
		name: 'replaceOrder',
		description: 'Replace order by order id for a specific account',
		schema: schwab_api_1.ReplaceOrderParams,
		call: function (c, p) {
			return __awaiter(void 0, void 0, void 0, function () {
				var order, displayMap
				return __generator(this, function (_a) {
					switch (_a.label) {
						case 0:
							return [
								4 /*yield*/,
								c.trader.orders.replaceOrder({
									pathParams: {
										accountNumber: p.accountNumber,
										orderId: p.orderId,
									},
									body: p,
								}),
							]
						case 1:
							order = _a.sent()
							return [4 /*yield*/, (0, schwab_api_1.buildAccountDisplayMap)(c)]
						case 2:
							displayMap = _a.sent()
							return [
								2 /*return*/,
								(0, schwab_api_1.scrubAccountIdentifiers)(order, displayMap),
							]
					}
				})
			})
		},
	}),
	(0, types_1.createToolSpec)({
		name: 'getTransactions',
		description: 'Get transactions',
		schema: schwab_api_1.GetTransactionsParams,
		call: function (c, p) {
			return __awaiter(void 0, void 0, void 0, function () {
				var accounts,
					transactions,
					_i,
					accounts_1,
					account,
					accountTransactions,
					displayMap
				return __generator(this, function (_a) {
					switch (_a.label) {
						case 0:
							log_1.logger.info('[getTransactions] Fetching accounts')
							return [4 /*yield*/, c.trader.accounts.getAccountNumbers()]
						case 1:
							accounts = _a.sent()
							if (accounts.length === 0) return [2 /*return*/, []]
							log_1.logger.info('[getTransactions] Fetching transactions', {
								accountCount: accounts.length,
								startDate: p.startDate,
								endDate: p.endDate,
								hasType: !!p.types,
								symbol: p.symbol,
							})
							transactions = []
							;(_i = 0), (accounts_1 = accounts)
							_a.label = 2
						case 2:
							if (!(_i < accounts_1.length)) return [3 /*break*/, 5]
							account = accounts_1[_i]
							return [
								4 /*yield*/,
								c.trader.transactions.getTransactions({
									pathParams: { accountNumber: account.hashValue },
									queryParams: {
										startDate: p.startDate,
										endDate: p.endDate,
										types: p.types,
										symbol: p.symbol,
									},
								}),
							]
						case 3:
							accountTransactions = _a.sent()
							log_1.logger.debug('[getTransactions] Transactions for account', {
								accountHash: account.hashValue,
								count: accountTransactions.length,
							})
							transactions.push.apply(transactions, accountTransactions)
							_a.label = 4
						case 4:
							_i++
							return [3 /*break*/, 2]
						case 5:
							return [4 /*yield*/, (0, schwab_api_1.buildAccountDisplayMap)(c)]
						case 6:
							displayMap = _a.sent()
							return [
								2 /*return*/,
								(0, schwab_api_1.scrubAccountIdentifiers)(
									transactions,
									displayMap,
								),
							]
					}
				})
			})
		},
	}),
	(0, types_1.createToolSpec)({
		name: 'getTransaction',
		description: 'Get transaction',
		schema: schwab_api_1.GetTransactionByIdParams,
		call: function (c, p) {
			return __awaiter(void 0, void 0, void 0, function () {
				return __generator(this, function (_a) {
					log_1.logger.info('[getTransaction] Fetching transaction', {
						transactionId: p.transactionId,
					})
					return [2 /*return*/]
				})
			})
		},
	}),
	(0, types_1.createToolSpec)({
		name: 'getUserPreference',
		description: 'Get user preference',
		schema: schwab_api_1.GetUserPreferenceParams,
		call: function (c, p) {
			return __awaiter(void 0, void 0, void 0, function () {
				var userPreference, displayMap
				var _a, _b, _c
				return __generator(this, function (_d) {
					switch (_d.label) {
						case 0:
							log_1.logger.info('[getUserPreference] Fetching user preference')
							return [4 /*yield*/, c.trader.userPreference.getUserPreference(p)]
						case 1:
							userPreference = _d.sent()
							if (userPreference.streamerInfo.length === 0) {
								return [2 /*return*/, []]
							}
							log_1.logger.info('[getUserPreference] User preference fetched', {
								hasAccounts:
									((_a = userPreference.accounts) === null || _a === void 0
										? void 0
										: _a.length) > 0,
								accountCount:
									((_b = userPreference.accounts) === null || _b === void 0
										? void 0
										: _b.length) || 0,
								hasStreamerInfo:
									((_c = userPreference.streamerInfo) === null || _c === void 0
										? void 0
										: _c.length) > 0,
							})
							return [4 /*yield*/, (0, schwab_api_1.buildAccountDisplayMap)(c)]
						case 2:
							displayMap = _d.sent()
							return [
								2 /*return*/,
								(0, schwab_api_1.scrubAccountIdentifiers)(
									userPreference,
									displayMap,
								),
							]
					}
				})
			})
		},
	}),
]
