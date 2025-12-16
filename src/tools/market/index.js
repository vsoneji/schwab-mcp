'use strict'
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
		name: 'getQuotes',
		description: 'Get quotes for a list of symbols',
		schema: schwab_api_1.GetQuotesParams,
		call: function (c, p) {
			return __awaiter(void 0, void 0, void 0, function () {
				return __generator(this, function (_a) {
					log_1.logger.info('[getQuotes] Fetching quotes', {
						symbols: p.symbols,
						fields: p.fields,
					})
					return [
						2 /*return*/,
						c.marketData.quotes.getQuotes({
							queryParams: {
								symbols: p.symbols,
								fields: p.fields,
								indicative: p.indicative,
							},
						}),
					]
				})
			})
		},
	}),
	(0, types_1.createToolSpec)({
		name: 'getQuoteBySymbolId',
		description: 'Get quote for a one symbol',
		schema: schwab_api_1.GetQuoteBySymbolIdParams,
		call: function (c, p) {
			return __awaiter(void 0, void 0, void 0, function () {
				var quoteData
				return __generator(this, function (_a) {
					switch (_a.label) {
						case 0:
							log_1.logger.info('[getQuoteBySymbolId] Fetching quote', {
								symbol_id: p.symbol_id,
								fields: p.fields,
							})
							return [
								4 /*yield*/,
								c.marketData.quotes.getQuoteBySymbolId({
									pathParams: { symbol_id: p.symbol_id },
									queryParams: { fields: p.fields },
								}),
							]
						case 1:
							quoteData = _a.sent()
							return [2 /*return*/, quoteData]
					}
				})
			})
		},
	}),
	(0, types_1.createToolSpec)({
		name: 'searchInstruments',
		description: 'Search for instruments by symbols and projections',
		schema: schwab_api_1.GetInstrumentsParams,
		call: function (c, p) {
			return c.marketData.instruments.getInstruments({
				queryParams: p,
			})
		},
	}),
	(0, types_1.createToolSpec)({
		name: 'getInstrumentByCusip',
		description: 'Get instrument by cusip',
		schema: schwab_api_1.GetInstrumentByCusipParams,
		call: function (c, p) {
			return __awaiter(void 0, void 0, void 0, function () {
				var instrument
				return __generator(this, function (_a) {
					switch (_a.label) {
						case 0:
							return [
								4 /*yield*/,
								c.marketData.instruments.getInstrumentByCusip({
									pathParams: { cusip_id: p.cusip_id },
								}),
							]
						case 1:
							instrument = _a.sent()
							return [2 /*return*/, instrument]
					}
				})
			})
		},
	}),
	(0, types_1.createToolSpec)({
		name: 'getMarketHours',
		description: 'Get market hours for different markets',
		schema: schwab_api_1.GetMarketHoursParams,
		call: function (c, p) {
			return c.marketData.marketHours.getMarketHours({
				queryParams: {
					markets: p.markets,
					date: p.date ? new Date(p.date).toISOString() : undefined,
				},
			})
		},
	}),
	(0, types_1.createToolSpec)({
		name: 'getMarketHoursByMarketId',
		description: 'Get market hours for a specific market',
		schema: schwab_api_1.GetMarketHoursByMarketIdParams,
		call: function (c, p) {
			return c.marketData.marketHours.getMarketHoursByMarketId({
				pathParams: { market_id: p.market_id },
				queryParams: { date: p.date },
			})
		},
	}),
	(0, types_1.createToolSpec)({
		name: 'getMovers',
		description: 'Get movers for a specific index',
		schema: schwab_api_1.GetMoversParams,
		call: function (c, p) {
			return c.marketData.movers.getMovers({
				pathParams: { symbol_id: p.symbol_id },
				queryParams: { sort: p.sort, frequency: p.frequency },
			})
		},
	}),
	(0, types_1.createToolSpec)({
		name: 'getOptionChain',
		description: 'Get option chain for an optionable symbol',
		schema: schwab_api_1.GetOptionChainParams,
		call: function (c, p) {
			return c.marketData.options.getOptionChain({
				queryParams: { symbol: p.symbol },
			})
		},
	}),
	(0, types_1.createToolSpec)({
		name: 'getOptionExpirationChain',
		description: 'Get option expiration chain for an optionable symbol',
		schema: schwab_api_1.GetOptionExpirationChainParams,
		call: function (c, p) {
			return c.marketData.options.getOptionExpirationChain({
				queryParams: { symbol: p.symbol },
			})
		},
	}),
	(0, types_1.createToolSpec)({
		name: 'getPriceHistory',
		description: 'Get price history for a specific symbol and date range',
		schema: schwab_api_1.GetPriceHistoryParams,
		call: function (c, p) {
			return c.marketData.priceHistory.getPriceHistory({
				queryParams: {
					symbol: p.symbol,
					period: p.period,
					periodType: p.periodType,
					frequency: p.frequency,
					frequencyType: p.frequencyType,
					startDate: p.startDate,
					endDate: p.endDate,
				},
			})
		},
	}),
]
