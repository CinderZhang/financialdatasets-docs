# Financial Datasets Documentation

This repository contains the documentation for the Financial Datasets API and a custom MCP (Model Context Protocol) server.

## Custom MCP Server

We've built a custom MCP server that allows AI assistants like Claude to access Financial Datasets API directly. The server provides tools for:

- 📈 Real-time stock prices and market data
- 💼 Financial statements (income, balance sheet, cash flow)
- 📊 Financial metrics and ratios
- 🔍 **Company search with 50+ financial filters** (newly added!)
- 🏢 Institutional ownership data
- 📰 Earnings press releases

**See full details and setup instructions in [./financialdatasets-mcp/README.md](./financialdatasets-mcp/README.md)**

# Mintlify Starter Kit

Click on `Use this template` to copy the Mintlify starter kit. The starter kit contains examples including

- Guide pages
- Navigation
- Customizations
- API Reference pages
- Use of popular components

### Development

Install the [Mintlify CLI](https://www.npmjs.com/package/mintlify) to preview the documentation changes locally. To install, use the following command

```
npm i -g mintlify
```

Run the following command at the root of your documentation (where mint.json is)

```
mintlify dev
```

### Publishing Changes

Install our Github App to auto propagate changes from your repo to your deployment. Changes will be deployed to production automatically after pushing to the default branch. Find the link to install on your dashboard. 

#### Troubleshooting

- Mintlify dev isn't running - Run `mintlify install` it'll re-install dependencies.
- Page loads as a 404 - Make sure you are running in a folder with `mint.json`


