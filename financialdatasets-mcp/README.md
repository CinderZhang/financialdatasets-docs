# Financial Datasets MCP Server

A Model Context Protocol (MCP) server that provides AI assistants with access to real-time financial market data through the [Financial Datasets API](https://financialdatasets.ai).

## Features

- 📈 **Stock Prices** - Real-time stock quotes and market data
- 💼 **Financial Statements** - Income statements, balance sheets, and cash flows
- 📊 **Financial Metrics** - Valuation ratios, profitability metrics, and efficiency indicators
- 🏢 **Institutional Ownership** - Track which investment firms own shares
- 📰 **Earnings Releases** - Access earnings press releases with full text
- 🔍 **Company Search** - Browse major companies by market cap

## Prerequisites

- Node.js 18+ installed
- Financial Datasets API key (get free at [financialdatasets.ai](https://financialdatasets.ai))
- Claude Desktop app

## Installation

1. Clone or download this repository:
   ```bash
   git clone https://github.com/yourusername/financialdatasets-mcp.git
   cd financialdatasets-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the server:
   ```bash
   npm run build
   ```

## Configuration

### 1. Set up your API key

Create a `.env` file in the project root:
```env
FINANCIAL_DATASETS_API_KEY=your_api_key_here
```

Or set it as an environment variable in your Claude Desktop config (see below).

### 2. Configure Claude Desktop

Add the server to your Claude Desktop configuration:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "financial-datasets": {
      "command": "node",
      "args": ["/absolute/path/to/financialdatasets-mcp/dist/index.js"],
      "env": {
        "FINANCIAL_DATASETS_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Replace `/absolute/path/to/` with your actual path, for example:
- Windows: `"C:\\Users\\username\\financialdatasets-mcp\\dist\\index.js"`
- macOS: `"/Users/username/financialdatasets-mcp/dist/index.js"`
- Linux: `"/home/username/financialdatasets-mcp/dist/index.js"`

### 3. Restart Claude Desktop

After saving the configuration, restart Claude Desktop completely. The Financial Datasets tools will be available in your conversations.

## Available Tools

### `get_stock_price`
Get current stock price and market data for any ticker.

**Example**: "What's the current price of Apple stock?"

### `get_financials`
Retrieve financial statements (income statement, balance sheet, cash flow).

**Parameters**:
- `ticker` - Stock symbol (required)
- `statement_type` - Type of statement: "all", "income", "balance", or "cash-flow"
- `period` - Time period: "annual", "quarterly", or "ttm"
- `limit` - Number of periods to return

**Example**: "Show me Tesla's quarterly income statements"

### `get_financial_metrics`
Get comprehensive financial ratios and metrics including P/E, ROE, margins, and more.

**Example**: "What are Microsoft's financial ratios?"

### `get_institutional_ownership`
See which investment firms own shares of a company.

**Example**: "Who are the top institutional owners of NVIDIA?"

### `get_earnings_releases`
Get recent earnings press releases with full text.

**Example**: "Show me Apple's latest earnings announcement"

### `search_companies`
Browse major companies by market cap.

**Example**: "Show me the largest tech companies"

## Usage Examples

Once configured, you can ask Claude:

- "What's the current price of AAPL?"
- "Show me Microsoft's financial statements for the last 4 quarters"
- "What are Tesla's profit margins?"
- "Who owns the most shares of Amazon?"
- "Find the latest earnings news for Google"
- "Compare the P/E ratios of Apple and Microsoft"

## Development

### Running in development mode
```bash
npm run dev
```

### Testing the server
```bash
# Set your API key
export FINANCIAL_DATASETS_API_KEY=your_api_key_here

# Run the server
npm start
```

You should see: "Financial Datasets MCP server started"

### Project Structure
```
financialdatasets-mcp/
├── src/
│   └── index.ts      # Main server implementation
├── dist/             # Compiled JavaScript
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── README.md         # This file
```

## Troubleshooting

### Tools don't appear in Claude
1. Make sure the path in your config is absolute and correct
2. Check that your API key is valid
3. Restart Claude Desktop completely
4. Check logs at: `%APPDATA%\Claude\logs\` (Windows) or `~/Library/Logs/Claude/` (macOS)

### API errors
- Ensure your API key is valid and has appropriate permissions
- Some endpoints require specific ticker symbols (e.g., earnings press releases)
- Check your API usage limits at [financialdatasets.ai](https://financialdatasets.ai)

### Windows-specific issues
- Use double backslashes `\\` in JSON config paths
- Ensure Node.js is in your system PATH
- Try running the server manually first to check for errors

## API Rate Limits

The Financial Datasets API has the following rate limits:
- **Free tier**: 60 requests per minute
- **Paid tiers**: Higher limits available

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

- Financial Datasets API: [Discord](https://discord.gg/hTtb8wzgSQ) | [Email](mailto:support@financialdatasets.ai)
- MCP Protocol: [Documentation](https://modelcontextprotocol.io)

## Acknowledgments

Built with the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk) by Anthropic.