#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = "http://localhost:3002";

// Create the MCP server following the official documentation
const server = new McpServer({
  name: "admin-api-server",
  version: "1.0.0",
  capabilities: {
    tools: {},
  },
});

// Store authentication headers for this server instance
let authHeaders = {};

// Read auth headers from environment if provided
if (process.env.MCP_AUTH_HEADERS) {
  try {
    authHeaders = JSON.parse(process.env.MCP_AUTH_HEADERS);
    console.error("Loaded auth headers from environment");
  } catch (error) {
    console.error("Failed to parse auth headers from environment:", error);
  }
}

// Register search_users tool using the modern API
server.tool(
  "search_users",
  "Search and filter users with pagination",
  {
    page: z
      .number()
      .default(1)
      .describe("Page number for pagination (default: 1)"),
    limit: z
      .number()
      .default(10)
      .describe("Number of users per page (default: 10)"),
    search: z
      .string()
      .optional()
      .describe("Search term to filter users by name or email"),
    role: z
      .enum(["admin", "customer"])
      .optional()
      .describe("Filter users by role"),
    sortBy: z
      .enum(["newest", "oldest", "name"])
      .default("newest")
      .describe("Sort users by criteria (default: newest)"),
  },
  async ({
    page = 1,
    limit = 10,
    search = "",
    role = "",
    sortBy = "newest",
  }) => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      if (role) params.append("role", role);
      params.append("sortBy", sortBy);

      const response = await fetch(`${BASE_URL}/api/users/search?${params}`, {
        headers: authHeaders,
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching users: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  },
);

// Register search_orders tool using the modern API
server.tool(
  "search_orders",
  "Search and filter orders with pagination",
  {
    page: z
      .number()
      .default(1)
      .describe("Page number for pagination (default: 1)"),
    limit: z
      .number()
      .default(10)
      .describe("Number of orders per page (default: 10)"),
    userId: z.string().optional().describe("Filter orders by user ID"),
    status: z
      .enum(["pending", "processing", "shipped", "delivered", "cancelled"])
      .optional()
      .describe("Filter orders by status"),
    minTotal: z.number().optional().describe("Minimum order total amount"),
    maxTotal: z.number().optional().describe("Maximum order total amount"),
    fromDate: z
      .string()
      .optional()
      .describe("Filter orders from this date (YYYY-MM-DD)"),
    toDate: z
      .string()
      .optional()
      .describe("Filter orders to this date (YYYY-MM-DD)"),
    sortBy: z
      .enum(["newest", "oldest", "totalHigh", "totalLow"])
      .default("newest")
      .describe("Sort orders by criteria (default: newest)"),
  },
  async ({
    page = 1,
    limit = 10,
    userId,
    status,
    minTotal,
    maxTotal,
    fromDate,
    toDate,
    sortBy = "newest",
  }) => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (userId) params.append("userId", userId);
      if (status) params.append("status", status);
      if (minTotal !== undefined)
        params.append("minTotal", minTotal.toString());
      if (maxTotal !== undefined)
        params.append("maxTotal", maxTotal.toString());
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);
      params.append("sortBy", sortBy);

      const response = await fetch(`${BASE_URL}/api/orders/search?${params}`, {
        headers: authHeaders,
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching orders: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  },
);

// Start the server following the official quickstart pattern
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Admin API MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
