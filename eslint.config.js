import defaultConfig from '@epic-web/config/eslint'

/** @type {import("eslint").Linter.Config} */
export default [
	...defaultConfig,
	{
		ignores: [
			'./.wrangler/**',
			'**/*.old.ts',
			'**/*.old/**',
			'**/*.js',
			'types/**/*.d.ts',
		],
	},
]
