// Tool types
export * from './types.js'

// Auto-registration of tools
import * as market from './market/index.js'
import * as trader from './trader/index.js'

export const allToolSpecs = [...trader.toolSpecs, ...market.toolSpecs]
