'use strict'
// Auth error definitions using class hierarchy
var __extends =
	(this && this.__extends) ||
	(function () {
		var extendStatics = function (d, b) {
			extendStatics =
				Object.setPrototypeOf ||
				({ __proto__: [] } instanceof Array &&
					function (d, b) {
						d.__proto__ = b
					}) ||
				function (d, b) {
					for (var p in b)
						if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]
				}
			return extendStatics(d, b)
		}
		return function (d, b) {
			if (typeof b !== 'function' && b !== null)
				throw new TypeError(
					'Class extends value ' + String(b) + ' is not a constructor or null',
				)
			extendStatics(d, b)
			function __() {
				this.constructor = d
			}
			d.prototype =
				b === null ? Object.create(b) : ((__.prototype = b.prototype), new __())
		}
	})()
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
var __rest =
	(this && this.__rest) ||
	function (s, e) {
		var t = {}
		for (var p in s)
			if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
				t[p] = s[p]
		if (s != null && typeof Object.getOwnPropertySymbols === 'function')
			for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
				if (
					e.indexOf(p[i]) < 0 &&
					Object.prototype.propertyIsEnumerable.call(s, p[i])
				)
					t[p[i]] = s[p[i]]
			}
		return t
	}
Object.defineProperty(exports, '__esModule', { value: true })
exports.AuthErrors = exports.AuthError = void 0
exports.formatAuthError = formatAuthError
exports.createJsonErrorResponse = createJsonErrorResponse
// Base class for all auth errors
var AuthError = /** @class */ (function (_super) {
	__extends(AuthError, _super)
	function AuthError(kind, status, message, cause) {
		var _this = _super.call(this, message) || this
		_this.name = _this.constructor.name
		_this.kind = kind
		_this.status = status
		_this.cause = cause
		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(_this, _this.constructor)
		}
		return _this
	}
	return AuthError
})(Error)
exports.AuthError = AuthError
// Concrete error classes
exports.AuthErrors = {
	MissingClientId: /** @class */ (function (_super) {
		__extends(MissingClientId, _super)
		function MissingClientId(cause) {
			return (
				_super.call(
					this,
					'MissingClientId',
					400,
					'Invalid request: clientId is missing',
					cause,
				) || this
			)
		}
		return MissingClientId
	})(AuthError),
	MissingState: /** @class */ (function (_super) {
		__extends(MissingState, _super)
		function MissingState(cause) {
			return (
				_super.call(
					this,
					'MissingState',
					400,
					'Invalid request: state.oauthReqInfo is missing',
					cause,
				) || this
			)
		}
		return MissingState
	})(AuthError),
	MissingParameters: /** @class */ (function (_super) {
		__extends(MissingParameters, _super)
		function MissingParameters(cause) {
			return (
				_super.call(
					this,
					'MissingParameters',
					400,
					'Missing required parameters',
					cause,
				) || this
			)
		}
		return MissingParameters
	})(AuthError),
	InvalidState: /** @class */ (function (_super) {
		__extends(InvalidState, _super)
		function InvalidState(cause) {
			return (
				_super.call(
					this,
					'InvalidState',
					400,
					'Invalid state: clientId is missing',
					cause,
				) || this
			)
		}
		return InvalidState
	})(AuthError),
	CookieDecode: /** @class */ (function (_super) {
		__extends(CookieDecode, _super)
		function CookieDecode(cause) {
			return (
				_super.call(
					this,
					'CookieDecode',
					400,
					'Could not decode state',
					cause,
				) || this
			)
		}
		return CookieDecode
	})(AuthError),
	InvalidCookieFormat: /** @class */ (function (_super) {
		__extends(InvalidCookieFormat, _super)
		function InvalidCookieFormat(cause) {
			return (
				_super.call(
					this,
					'InvalidCookieFormat',
					400,
					'Invalid cookie format received',
					cause,
				) || this
			)
		}
		return InvalidCookieFormat
	})(AuthError),
	InvalidRequestMethod: /** @class */ (function (_super) {
		__extends(InvalidRequestMethod, _super)
		function InvalidRequestMethod(cause) {
			return (
				_super.call(
					this,
					'InvalidRequestMethod',
					400,
					'Invalid request method. Expected POST.',
					cause,
				) || this
			)
		}
		return InvalidRequestMethod
	})(AuthError),
	MissingFormState: /** @class */ (function (_super) {
		__extends(MissingFormState, _super)
		function MissingFormState(cause) {
			return (
				_super.call(
					this,
					'MissingFormState',
					400,
					"Missing or invalid 'state' in form data.",
					cause,
				) || this
			)
		}
		return MissingFormState
	})(AuthError),
	ClientIdExtraction: /** @class */ (function (_super) {
		__extends(ClientIdExtraction, _super)
		function ClientIdExtraction(cause) {
			return (
				_super.call(
					this,
					'ClientIdExtraction',
					400,
					'Could not extract clientId from state object.',
					cause,
				) || this
			)
		}
		return ClientIdExtraction
	})(AuthError),
	CookieSignature: /** @class */ (function (_super) {
		__extends(CookieSignature, _super)
		function CookieSignature(cause) {
			return (
				_super.call(
					this,
					'CookieSignature',
					401,
					'Cookie signature verification failed',
					cause,
				) || this
			)
		}
		return CookieSignature
	})(AuthError),
	AuthRequest: /** @class */ (function (_super) {
		__extends(AuthRequest, _super)
		function AuthRequest(cause) {
			return (
				_super.call(
					this,
					'AuthRequest',
					500,
					'Error processing authorization request',
					cause,
				) || this
			)
		}
		return AuthRequest
	})(AuthError),
	AuthApproval: /** @class */ (function (_super) {
		__extends(AuthApproval, _super)
		function AuthApproval(cause) {
			return (
				_super.call(
					this,
					'AuthApproval',
					500,
					'Error processing approval',
					cause,
				) || this
			)
		}
		return AuthApproval
	})(AuthError),
	AuthCallback: /** @class */ (function (_super) {
		__extends(AuthCallback, _super)
		function AuthCallback(cause) {
			return (
				_super.call(
					this,
					'AuthCallback',
					500,
					'Authorization failed during callback processing',
					cause,
				) || this
			)
		}
		return AuthCallback
	})(AuthError),
	AuthUrl: /** @class */ (function (_super) {
		__extends(AuthUrl, _super)
		function AuthUrl(cause) {
			return (
				_super.call(
					this,
					'AuthUrl',
					500,
					'Error creating authorization URL',
					cause,
				) || this
			)
		}
		return AuthUrl
	})(AuthError),
	NoUserId: /** @class */ (function (_super) {
		__extends(NoUserId, _super)
		function NoUserId(cause) {
			return (
				_super.call(
					this,
					'NoUserId',
					500,
					'Failed to retrieve user information after Schwab auth',
					cause,
				) || this
			)
		}
		return NoUserId
	})(AuthError),
	TokenExchange: /** @class */ (function (_super) {
		__extends(TokenExchange, _super)
		function TokenExchange(cause) {
			return (
				_super.call(
					this,
					'TokenExchange',
					500,
					'Failed to exchange Schwab authorization code for tokens',
					cause,
				) || this
			)
		}
		return TokenExchange
	})(AuthError),
	ApiResponse: /** @class */ (function (_super) {
		__extends(ApiResponse, _super)
		function ApiResponse(cause) {
			return (
				_super.call(
					this,
					'ApiResponse',
					500,
					'Schwab API request failed during authorization flow',
					cause,
				) || this
			)
		}
		return ApiResponse
	})(AuthError),
	CookieSecretMissing: /** @class */ (function (_super) {
		__extends(CookieSecretMissing, _super)
		function CookieSecretMissing(cause) {
			return (
				_super.call(
					this,
					'CookieSecretMissing',
					500,
					'COOKIE_SECRET is not defined. A secret key is required for signing cookies.',
					cause,
				) || this
			)
		}
		return CookieSecretMissing
	})(AuthError),
}
function formatAuthError(error, details) {
	var filtered = details
	if (details) {
		var stack = details.stack,
			rest = __rest(details, ['stack'])
		filtered = rest
	}
	return __assign(
		{ message: error.message, status: error.status },
		filtered && { details: filtered },
	)
}
function createJsonErrorResponse(error, requestId, additionalDetails) {
	return __assign(
		__assign(
			{ code: error.kind, message: error.message },
			requestId && { requestId: requestId },
		),
		additionalDetails && { details: additionalDetails },
	)
}
