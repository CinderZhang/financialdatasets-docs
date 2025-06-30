#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from 'node-fetch';

// Simple Financial Datasets API client
class FinancialDatasetsClient {
  private apiKey: string;
  public readonly baseUrl = 'https://api.financialdatasets.ai';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async request(endpoint: string, params: Record<string, any> = {}, useHeaderAuth = false): Promise<any> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add query params
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
    
    // Add authentication
    const headers: Record<string, string> = {};
    if (useHeaderAuth) {
      headers['X-API-KEY'] = this.apiKey;
    } else {
      url.searchParams.append('api_key', this.apiKey);
    }

    const response = await fetch(url.toString(), { headers });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }
}

// Initialize MCP server
const server = new Server(
  {
    name: "financialdatasets-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Get API key from environment
const apiKey = process.env.FINANCIAL_DATASETS_API_KEY;
if (!apiKey) {
  console.error("Error: FINANCIAL_DATASETS_API_KEY environment variable is required");
  process.exit(1);
}

const client = new FinancialDatasetsClient(apiKey);

// Define available tools
const TOOLS: Tool[] = [
  {
    name: "get_stock_price",
    description: "Get current stock price and market data for a given ticker symbol",
    inputSchema: {
      type: "object",
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker symbol (e.g., AAPL, MSFT)",
        },
      },
      required: ["ticker"],
    },
  },
  {
    name: "get_financials",
    description: "Get financial statements (income statement, balance sheet, cash flow) for a company",
    inputSchema: {
      type: "object",
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker symbol",
        },
        statement_type: {
          type: "string",
          description: "Type of financial statement",
          enum: ["all", "income", "balance", "cash-flow"],
          default: "all",
        },
        period: {
          type: "string",
          description: "Time period for the data",
          enum: ["annual", "quarterly", "ttm"],
          default: "quarterly",
        },
        limit: {
          type: "number",
          description: "Number of periods to return",
          default: 4,
        },
      },
      required: ["ticker"],
    },
  },
  {
    name: "search_companies",
    description: "Search for companies by financial metrics using filters. You can filter by revenue, debt, cash flow, and 50+ other financial metrics.",
    inputSchema: {
      type: "object",
      properties: {
        filters: {
          type: "array",
          description: "Array of filters to apply. Each filter has a field, operator (eq, gt, gte, lt, lte), and value",
          items: {
            type: "object",
            properties: {
              field: {
                type: "string",
                description: "Financial metric to filter by (e.g., revenue, total_debt, net_income, capital_expenditure)",
              },
              operator: {
                type: "string",
                enum: ["eq", "gt", "gte", "lt", "lte"],
                description: "Comparison operator",
              },
              value: {
                type: "number",
                description: "Value to compare against",
              },
            },
            required: ["field", "operator", "value"],
          },
        },
        period: {
          type: "string",
          enum: ["annual", "quarterly", "ttm"],
          description: "Time period for the data",
          default: "ttm",
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return",
          default: 10,
        },
      },
      required: ["filters"],
    },
  },
  {
    name: "get_earnings_releases",
    description: "Get earnings press releases for a company. Returns recent earnings announcements with full text.",
    inputSchema: {
      type: "object",
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker symbol",
        },
        limit: {
          type: "number",
          description: "Number of press releases to return",
          default: 5,
        },
      },
      required: ["ticker"],
    },
  },
  {
    name: "get_financial_metrics",
    description: "Get financial metrics and ratios for a company. Includes valuation ratios, profitability metrics, efficiency ratios, and more.",
    inputSchema: {
      type: "object",
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker symbol",
        },
      },
      required: ["ticker"],
    },
  },
  {
    name: "get_institutional_ownership",
    description: "Get institutional ownership data for a company. Shows which investment firms own shares and how much.",
    inputSchema: {
      type: "object",
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker symbol",
        },
        limit: {
          type: "number",
          description: "Number of institutional owners to return",
          default: 10,
        },
      },
      required: ["ticker"],
    },
  },
];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_stock_price": {
        const { ticker } = args as { ticker: string };
        const response = await client.request('/prices/snapshot', { ticker });
        
        if (!response || !response.snapshot) {
          return {
            content: [{
              type: "text",
              text: `No price data found for ticker ${ticker}`,
            }],
          };
        }

        const price = response.snapshot;
        return {
          content: [{
            type: "text",
            text: `${price.ticker}
Current Price: $${price.price}
Change: ${price.day_change >= 0 ? '+' : ''}${price.day_change} (${price.day_change_percent >= 0 ? '+' : ''}${price.day_change_percent}%)
Volume: ${price.volume?.toLocaleString() || 'N/A'}
Market Cap: $${(price.market_cap / 1000000000).toFixed(2)}B
Last Updated: ${new Date(price.time).toLocaleString()}`,
          }],
        };
      }

      case "get_financials": {
        const { ticker, statement_type = "all", period = "quarterly", limit = 4 } = args as {
          ticker: string;
          statement_type?: string;
          period?: string;
          limit?: number;
        };

        let endpoint = '/financials';
        if (statement_type !== "all") {
          const typeMap: Record<string, string> = {
            income: '/financials/income-statements',
            balance: '/financials/balance-sheets',
            'cash-flow': '/financials/cash-flow-statements',
          };
          endpoint = typeMap[statement_type] || endpoint;
        }

        const response = await client.request(endpoint, { ticker, period, limit });
        
        // Get the data from the appropriate key based on endpoint
        let statements: any[] = [];
        if (response.income_statements) statements = response.income_statements;
        else if (response.balance_sheets) statements = response.balance_sheets;
        else if (response.cash_flow_statements) statements = response.cash_flow_statements;
        else if (response.financials) statements = response.financials;
        
        if (!statements || statements.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No financial data found for ${ticker}`,
            }],
          };
        }

        // Format the financial data
        let output = `Financial Statements for ${ticker} (${period})\n\n`;
        
        statements.slice(0, limit).forEach((statement: any) => {
          output += `Period: ${statement.fiscal_period || statement.report_period}\n`;
          output += `Report Date: ${statement.report_period}\n\n`;
          
          if (statement.revenue !== undefined) {
            output += "Income Statement:\n";
            output += `  Revenue: $${(statement.revenue / 1000000).toFixed(0)}M\n`;
            if (statement.gross_profit) output += `  Gross Profit: $${(statement.gross_profit / 1000000).toFixed(0)}M\n`;
            if (statement.operating_income) output += `  Operating Income: $${(statement.operating_income / 1000000).toFixed(0)}M\n`;
            if (statement.net_income) output += `  Net Income: $${(statement.net_income / 1000000).toFixed(0)}M\n`;
            if (statement.earnings_per_share) output += `  EPS: $${statement.earnings_per_share}\n`;
            output += "\n";
          }
          
          if (statement.total_assets !== undefined) {
            output += "Balance Sheet:\n";
            output += `  Total Assets: $${(statement.total_assets / 1000000).toFixed(0)}M\n`;
            if (statement.total_liabilities) output += `  Total Liabilities: $${(statement.total_liabilities / 1000000).toFixed(0)}M\n`;
            if (statement.total_stockholders_equity) output += `  Total Equity: $${(statement.total_stockholders_equity / 1000000).toFixed(0)}M\n`;
            if (statement.cash_and_cash_equivalents) output += `  Cash: $${(statement.cash_and_cash_equivalents / 1000000).toFixed(0)}M\n`;
            output += "\n";
          }
          
          if (statement.net_cash_flow_from_operating_activities !== undefined) {
            output += "Cash Flow:\n";
            output += `  Operating Cash Flow: $${(statement.net_cash_flow_from_operating_activities / 1000000).toFixed(0)}M\n`;
            if (statement.net_cash_flow_from_investing_activities) output += `  Investing Cash Flow: $${(statement.net_cash_flow_from_investing_activities / 1000000).toFixed(0)}M\n`;
            if (statement.net_cash_flow_from_financing_activities) output += `  Financing Cash Flow: $${(statement.net_cash_flow_from_financing_activities / 1000000).toFixed(0)}M\n`;
            if (statement.free_cash_flow) output += `  Free Cash Flow: $${(statement.free_cash_flow / 1000000).toFixed(0)}M\n`;
            output += "\n";
          }
          
          output += "---\n\n";
        });

        return {
          content: [{
            type: "text",
            text: output,
          }],
        };
      }

      case "search_companies": {
        const { filters, period = "ttm", limit = 10 } = args as {
          filters: Array<{ field: string; operator: string; value: number }>;
          period?: string;
          limit?: number;
        };

        // Validate filters
        if (!filters || filters.length === 0) {
          return {
            content: [{
              type: "text",
              text: "Please provide at least one filter for the search",
            }],
          };
        }

        // Prepare the request body
        const body = {
          period,
          limit,
          filters,
        };

        // Make POST request to search endpoint with header authentication
        const url = `${client.baseUrl}/financials/search`;
        const headers = {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        };

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            const error = await response.text();
            throw new Error(`Search API Error: ${response.status} - ${error}`);
          }

          const data = await response.json() as { search_results?: any[] };
          
          if (!data.search_results || data.search_results.length === 0) {
            return {
              content: [{
                type: "text",
                text: "No companies found matching your search criteria",
              }],
            };
          }

          let output = `Found ${data.search_results.length} companies matching your criteria:\n\n`;
          
          data.search_results.forEach((result: any) => {
            output += `${result.ticker}\n`;
            output += `  Report Period: ${result.report_period} (${result.period})\n`;
            
            // Display the filtered fields that were returned
            Object.keys(result).forEach(key => {
              if (key !== 'ticker' && key !== 'report_period' && key !== 'period' && key !== 'currency') {
                const value = result[key];
                // Format large numbers
                if (typeof value === 'number' && Math.abs(value) > 1000000) {
                  output += `  ${key}: $${(value / 1000000).toFixed(1)}M\n`;
                } else if (typeof value === 'number') {
                  output += `  ${key}: ${value}\n`;
                }
              }
            });
            output += '\n';
          });

          return {
            content: [{
              type: "text",
              text: output,
            }],
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error searching companies: ${error instanceof Error ? error.message : String(error)}`,
            }],
            isError: true,
          };
        }
      }

      case "get_earnings_releases": {
        const { ticker, limit = 5 } = args as { ticker: string; limit?: number };
        
        // Earnings endpoint requires header authentication
        const response = await client.request('/earnings/press-releases', { ticker, limit }, true);
        
        if (!response || !response.press_releases || response.press_releases.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No earnings press releases found for ${ticker}`,
            }],
          };
        }

        let output = `Earnings Press Releases for ${ticker}\n\n`;
        
        response.press_releases.slice(0, limit).forEach((release: any) => {
          output += `Title: ${release.title}\n`;
          output += `Date: ${new Date(release.date).toLocaleDateString()}\n`;
          output += `URL: ${release.url}\n`;
          output += `\nText (first 500 chars):\n${release.text.substring(0, 500)}...\n`;
          output += "\n---\n\n";
        });

        return {
          content: [{
            type: "text",
            text: output,
          }],
        };
      }

      case "get_financial_metrics": {
        const { ticker } = args as { ticker: string };
        
        const response = await client.request('/financial-metrics/snapshot', { ticker });
        
        if (!response || !response.snapshot) {
          return {
            content: [{
              type: "text",
              text: `No financial metrics found for ${ticker}`,
            }],
          };
        }

        const metrics = response.snapshot;
        const formatPercent = (val: number) => (val * 100).toFixed(2) + '%';
        const formatRatio = (val: number) => val?.toFixed(2) || 'N/A';
        
        let output = `Financial Metrics for ${ticker}\n\n`;
        
        output += "Valuation Metrics:\n";
        output += `  Market Cap: $${(metrics.market_cap / 1000000000).toFixed(2)}B\n`;
        output += `  P/E Ratio: ${formatRatio(metrics.price_to_earnings_ratio)}\n`;
        output += `  P/B Ratio: ${formatRatio(metrics.price_to_book_ratio)}\n`;
        output += `  P/S Ratio: ${formatRatio(metrics.price_to_sales_ratio)}\n`;
        output += `  EV/EBITDA: ${formatRatio(metrics.enterprise_value_to_ebitda_ratio)}\n`;
        output += `  PEG Ratio: ${formatRatio(metrics.peg_ratio)}\n\n`;
        
        output += "Profitability Metrics:\n";
        output += `  Gross Margin: ${formatPercent(metrics.gross_margin)}\n`;
        output += `  Operating Margin: ${formatPercent(metrics.operating_margin)}\n`;
        output += `  Net Margin: ${formatPercent(metrics.net_margin)}\n`;
        output += `  ROE: ${formatPercent(metrics.return_on_equity)}\n`;
        output += `  ROA: ${formatPercent(metrics.return_on_assets)}\n`;
        output += `  ROIC: ${formatPercent(metrics.return_on_invested_capital)}\n\n`;
        
        output += "Efficiency Metrics:\n";
        output += `  Asset Turnover: ${formatRatio(metrics.asset_turnover)}\n`;
        output += `  Inventory Turnover: ${formatRatio(metrics.inventory_turnover)}\n`;
        output += `  Receivables Turnover: ${formatRatio(metrics.receivables_turnover)}\n`;
        output += `  FCF Yield: ${formatPercent(metrics.free_cash_flow_yield)}\n`;

        return {
          content: [{
            type: "text",
            text: output,
          }],
        };
      }

      case "get_institutional_ownership": {
        const { ticker, limit = 10 } = args as { ticker: string; limit?: number };
        
        const response = await client.request('/institutional-ownership', { ticker, limit });
        
        if (!response || !response.institutional_ownership || response.institutional_ownership.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No institutional ownership data found for ${ticker}`,
            }],
          };
        }

        let output = `Institutional Ownership for ${ticker}\n\n`;
        let totalShares = 0;
        let totalValue = 0;
        
        response.institutional_ownership.forEach((owner: any) => {
          output += `${owner.investor.replace(/_/g, ' ')}\n`;
          output += `  Shares: ${owner.shares.toLocaleString()}\n`;
          output += `  Value: $${(owner.market_value / 1000000).toFixed(2)}M\n`;
          output += `  Avg Price: $${owner.price}\n`;
          output += `  Report Date: ${new Date(owner.report_period).toLocaleDateString()}\n\n`;
          
          totalShares += owner.shares;
          totalValue += owner.market_value;
        });
        
        output += `---\n`;
        output += `Total Institutional Shares: ${totalShares.toLocaleString()}\n`;
        output += `Total Institutional Value: $${(totalValue / 1000000000).toFixed(2)}B\n`;

        return {
          content: [{
            type: "text",
            text: output,
          }],
        };
      }

      default:
        return {
          content: [{
            type: "text",
            text: `Unknown tool: ${name}`,
          }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Financial Datasets MCP server started");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});