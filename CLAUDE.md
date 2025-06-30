# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the documentation website for Financial Datasets API, built using Mintlify. The site documents a comprehensive financial data API serving 30,000+ tickers with 30+ years of historical data.

## Commands

### Development
- **Install Mintlify CLI**: `npm i -g mintlify`
- **Run local development server**: `mintlify dev` (run in root directory where mint.json is located)
- **Troubleshooting**: If mintlify dev isn't running, run `mintlify install` to re-install dependencies

### Deployment
- Changes are automatically deployed when pushed to the main branch via GitHub integration
- No manual build or deployment commands needed

## Architecture & Structure

### Documentation Framework
- **Mintlify**: Modern documentation framework with MDX support
- **Configuration**: `mint.json` controls site structure, navigation, branding, and theme
- **API Specification**: `api-reference/openapi.json` defines the complete API schema

### Directory Organization
```
api-reference/endpoint/     # API endpoint documentation organized by category
├── company/               # Company data endpoints (facts)
├── crypto/                # Cryptocurrency data
├── earnings/              # Earnings and press releases
├── filings/               # SEC filings
├── financial-metrics/     # Financial metrics and ratios
├── financials/            # Financial statements
├── insider-trades/        # Insider trading data
├── institutional-ownership/
├── macro/                 # Macroeconomic data (interest rates)
├── news/                  # Company news
├── options/               # Options chains and historical data
└── prices/                # Stock price data
```

### Key Files
- **mint.json**: Main configuration for navigation, branding, colors, and site metadata
- **api-reference/openapi.json**: OpenAPI 3.0.1 specification for generating interactive API docs
- **public/llms.txt**: Simplified API documentation for LLM consumption
- **snippets/**: Reusable content components

### Documentation Pages
- All documentation uses `.mdx` format (Markdown with JSX)
- Supports Mintlify components like tabs, code groups, and API references
- Images stored in `images/` and `logo/` directories

## Important Context

### API Endpoints Categories
The API provides data for:
- Financial statements (income, balance sheet, cash flow, segmented revenues)
- Real-time and historical stock prices
- SEC filings and regulatory documents
- Insider trading and institutional ownership
- Options data and chains
- Company news and earnings
- Cryptocurrency data
- Macroeconomic indicators (interest rates)
- Financial metrics and ratios

### MCP Server Integration
The project includes documentation for a Model Context Protocol server (`mcp-server.mdx`) that allows AI models to directly access financial data.

### Authentication
All API endpoints require an API key passed as a query parameter (`api_key`).

## Development Guidelines

When modifying documentation:
1. Use MDX format for all documentation pages
2. Follow existing navigation structure in mint.json
3. Ensure API examples match the OpenAPI specification
4. Test changes locally with `mintlify dev` before committing
5. Update both the MDX documentation and OpenAPI spec when adding/modifying endpoints

## Development Principles

When working on any development tasks in this repository:
1. **KISS (Keep It Simple, Stupid)**: Always choose the simplest solution that works. Avoid over-engineering.
2. **Be Truthful**: Only state what you know to be true. If uncertain, investigate first or clearly state assumptions.
3. **Think Thoroughly**: Analyze requirements completely before implementing. Consider edge cases and implications.
4. **Act as Subject Expert**: 
   - Software Engineering for coding tasks
   - System Engineering for design decisions
   - Professor mindset for learning and explaining concepts