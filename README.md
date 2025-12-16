# Schwab MCP Server

A Model Context Protocol (MCP) server that enables AI assistants like Claude to
securely interact with Charles Schwab accounts and market data through the
official Schwab API.

## What You Can Do

Ask Claude to:

- "Show me my Schwab account balances and positions"
- "Get real-time quotes for AAPL, GOOGL, and MSFT"
- "What are today's market movers in the $SPX?"
- "Show me the options chain for TSLA with Greeks"
- "Get my transactions from the last 30 days"
- "Search for ETFs related to technology"
- "Check if the markets are open"

## Unofficial MCP Server

This is an unofficial, community-developed TypeScript MCP server for Charles
Schwab. It has not been approved, endorsed, or certified by Charles Schwab. It
is provided as-is, and its functionality may be incomplete or unstable. Use at
your own risk, especially when dealing with financial data or transactions.

## Overview

This MCP server acts as a bridge between AI assistants and the Schwab API,
providing:

- **Secure OAuth Authentication**: Implements Schwab's OAuth 2.0 flow with PKCE
  for secure authentication
- **Comprehensive Trading Tools**: Access to accounts, orders, quotes, and
  transactions
- **Market Data Tools**: Real-time quotes, price history, market hours, movers,
  and options chains
- **Account Privacy**: Built-in account identifier scrubbing to protect
  sensitive information
- **Local-Only**: Runs entirely on your machine with local HTTPS server and file-based token storage

## Features

### Trading Tools

- **Account Management**
  - `getAccounts`: Retrieve all account information with positions and balances
  - `getAccountNumbers`: Get list of account identifiers
- **Order Management**
  - `getOrder`: Get order by ID
  - `getOrders`: Fetch orders with filtering by status, time range, and symbol
  - `getOrdersByAccountNumber`: Get orders by account number
  - `cancelOrder`: Cancel an order (Experimental)
  - `placeOrder`: Place an order (Experimental)
  - `replaceOrder`: Replace an order (Experimental)
- **Market Quotes**
  - `getQuotes`: Get real-time quotes for multiple symbols
  - `getQuoteBySymbolId`: Get detailed quote for a single symbol
- **Transaction History**
  - `getTransactions`: Retrieve transaction history across all accounts with
    date filtering
- **User Preferences**
  - `getUserPreference`: Retrieve user trading preferences and settings

### Market Data Tools

- **Instrument Search**
  - `searchInstruments`: Search for securities by symbol with
    fundamental/reference data
- **Price History**
  - `getPriceHistory`: Get historical price data with customizable periods and
    frequencies
- **Market Hours**
  - `getMarketHours`: Check market operating hours by date
  - `getMarketHoursByMarketId`: Get specific market information
- **Market Movers**
  - `getMovers`: Find top market movers by index ($SPX, $COMPX, $DJI)
- **Options Chains**
  - `getOptionChain`: Retrieve full options chain data with Greeks
  - `getOptionExpirationChain`: Get option expiration dates

## Prerequisites

1. **Schwab Developer Account**: Register at
   [Schwab Developer Portal](https://developer.schwab.com)
2. **Node.js**: Version 20.x or higher (22.x recommended)

## Getting Started

### Quick Setup

```bash
git clone <repository-url>
cd schwab-mcp
npm install

# Configure your environment
cp .env.example .env
# Edit .env with your Schwab app credentials

# Start the MCP server (will prompt for OAuth on first run)
npm run start
```

### Configuration

#### 1. Create a Schwab App

1. Log in to the [Schwab Developer Portal](https://developer.schwab.com)
2. Create a new app with:
   - **App Name**: Your MCP server name (e.g., "My Schwab MCP")
   - **Callback URL**: `https://localhost:3000/callback`
   - **App Type**: Personal
3. Note your **App Key** (Client ID) and generate an **App Secret**

#### 2. Configure Environment Variables

Copy the `.env.example` file to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Schwab OAuth Configuration
SCHWAB_CLIENT_ID=your_schwab_app_key_here
SCHWAB_CLIENT_SECRET=your_schwab_app_secret_here

# OAuth Redirect URI (must match what you configured in Schwab Developer Portal)
SCHWAB_REDIRECT_URI=https://localhost:3000/callback

# Optional: Port for HTTPS server (default: 3000)
PORT=3000

# Optional: Log level (trace, debug, info, warn, error, fatal)
LOG_LEVEL=info

# Optional: Environment (development, staging, production)
ENVIRONMENT=production
```

#### 3. First Run - OAuth Authentication

On the first run, the server will:

1. Generate self-signed certificates in `.certs/` directory (no OpenSSL required)
2. Start an HTTPS server on `https://localhost:3000`
3. Open your browser to the Schwab authorization page
4. After you authorize, tokens will be saved to `.auth/` directory
5. The MCP server will start and be ready to use

```bash
npm run start
```

**Note**: You may need to trust the self-signed certificate in your browser or system. The certificate is only used for localhost OAuth callback and is generated automatically using Node.js crypto libraries.

## Usage

### Claude Desktop Configuration

Add the server to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "schwab": {
      "command": "npx",
      "args": [
        "tsx",
        "/path/to/schwab-mcp/src/index.ts"
      ],
      "env": {
        "SCHWAB_CLIENT_ID": "your_app_key",
        "SCHWAB_CLIENT_SECRET": "your_app_secret",
        "SCHWAB_REDIRECT_URI": "https://localhost:3000/callback"
      }
    }
  }
}
```

Or if you prefer to build first and run the compiled JavaScript:

```json
{
  "mcpServers": {
    "schwab": {
      "command": "node",
      "args": [
        "/path/to/schwab-mcp/dist/index.js"
      ],
      "env": {
        "SCHWAB_CLIENT_ID": "your_app_key",
        "SCHWAB_CLIENT_SECRET": "your_app_secret",
        "SCHWAB_REDIRECT_URI": "https://localhost:3000/callback"
      }
    }
  }
}
```

Note: The first option using `tsx` is recommended as it doesn't require a build step.

Restart Claude Desktop. The server will connect via stdio transport.

### Example Commands

Once connected, you can ask Claude to:

- "Show me my Schwab account balances"
- "Get a quote for AAPL"
- "What are today's market movers in the $SPX?"
- "Show me the options chain for TSLA"
- "Get my recent transactions from the last week"

## Architecture

### Technology Stack

- **Runtime**: Node.js with TypeScript
- **Authentication**: OAuth 2.0 with PKCE via `@sudowealth/schwab-api`
- **API Client**: `@sudowealth/schwab-api` for type-safe Schwab API access
- **MCP Framework**: `@modelcontextprotocol/sdk` with stdio transport
- **State Management**: File-based token storage in `.auth/` directory
- **OAuth Server**: Express with HTTPS for OAuth callback handling

### Security Features

1. **OAuth 2.0 with PKCE**: Secure authentication flow preventing authorization
   code interception
2. **Local Token Storage**: Tokens stored locally in `.auth/` directory (never sent to external servers)
3. **HTTPS Localhost**: Self-signed certificates for secure OAuth callback
4. **Automatic Token Refresh**: Tokens refreshed 5 minutes before expiration
5. **Account Scrubbing**: Sensitive account identifiers automatically replaced with display names
6. **Secret Redaction**: Automatic masking of sensitive data in logs

## Development

### Available Scripts

```bash
npm run start        # Start the MCP server
npm run dev          # Start in development mode (same as start)
npm run build        # Build TypeScript to JavaScript
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run validate     # Run typecheck and lint together
```

### Project Structure

```
schwab-mcp/
├── .auth/           # OAuth tokens (git-ignored)
├── .certs/          # Self-signed certificates (git-ignored)
├── src/
│   ├── index.ts     # Main MCP server entry point
│   ├── auth/        # OAuth authentication client
│   ├── server/      # OAuth HTTP server and certificate generation
│   ├── shared/      # Shared utilities (logging, token storage)
│   └── tools/       # MCP tool implementations
├── .env             # Environment variables (git-ignored)
└── .env.example     # Example environment variables
```

### Debugging

The server includes comprehensive logging with configurable levels:

- **Log Levels**: trace, debug, info, warn, error, fatal
- Set via `LOG_LEVEL` environment variable in `.env`

Enable debug logging to see detailed OAuth flow and API interactions:

```env
LOG_LEVEL=debug
```

### Error Handling

The server implements robust error handling with specific error types:

- **Authentication Errors (401)**: Prompt for re-authentication
- **Client Errors (400)**: Invalid parameters, missing data
- **Server Errors (500)**: API failures, configuration issues
- All errors include request IDs for Schwab API troubleshooting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Troubleshooting

### Common Issues

1. **"Certificate error" in browser**

   - This is expected with self-signed certificates
   - Accept the certificate warning during OAuth flow
   - The certificate is only used for `https://localhost:3000/callback`

2. **"Cannot find module" errors**

   - Run `npm install` to ensure all dependencies are installed
   - Make sure you're using Node.js 20.x or higher

3. **Authentication failures**

   - Verify your redirect URI matches exactly: `https://localhost:3000/callback`
   - Check that your Schwab app credentials are correct in `.env`
   - Enable debug logging: `LOG_LEVEL=debug` in `.env`

4. **"Port already in use" error**

   - Change the PORT in `.env` to a different value
   - Make sure no other process is using port 3000

## Recent Updates

- **Local-Only Architecture**: Migrated from Cloudflare Workers to local Node.js server
- **File-Based Token Storage**: Tokens stored securely in local `.auth/` directory
- **HTTPS OAuth Flow**: Self-signed certificates for secure localhost OAuth callback
- **Stdio Transport**: Uses standard MCP SDK with stdio for Claude Desktop integration

## Acknowledgments

- Uses [Model Context Protocol](https://modelcontextprotocol.io/)
- Powered by
  [@sudowealth/schwab-api](https://www.npmjs.com/package/@sudowealth/schwab-api)
- Built with [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
