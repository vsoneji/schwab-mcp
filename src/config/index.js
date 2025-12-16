'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.getConfig = void 0
// Export all functionality from the AppConfig module
var appConfig_1 = require('./appConfig')
Object.defineProperty(exports, 'getConfig', {
	enumerable: true,
	get: function () {
		return appConfig_1.getConfig
	},
})
