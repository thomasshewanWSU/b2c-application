import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

async function testMCP() {
  console.log("Starting MCP test...");

  try {
    // Path to the MCP server
    const serverPath = path.join(process.cwd(), "mcp-server.js");
    console.log("Starting MCP server at:", serverPath);

    // Create transport and client
    const mcpTransport = new StdioClientTransport({
      command: "node",
      args: [serverPath],
    });

    const mcpClient = new Client(
      {
        name: "test-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      },
    );

    console.log("Connecting to MCP server...");
    await mcpClient.connect(mcpTransport);
    console.log("Connected to MCP server");

    // Wait a moment for the server to be fully ready
    await new Promise((resolve) => setTimeout(resolve, 200));

    console.log("Requesting tools from MCP server...");

    try {
      const toolsResponse = await mcpClient.listTools();

      console.log(
        "SUCCESS! Tools response:",
        JSON.stringify(toolsResponse, null, 2),
      );

      // Test calling a tool
      console.log("\nTesting tool call...");
      const testResult = await mcpClient.callTool({
        name: "search_users",
        arguments: { page: 1, limit: 5 },
      });

      console.log("Tool call result:", JSON.stringify(testResult, null, 2));
    } catch (error) {
      console.error("ERROR requesting tools:", error);
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace",
      );
    }

    // Cleanup
    await mcpClient.close();
    await mcpTransport.close();
  } catch (error) {
    console.error("Failed to test MCP:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );
  }
}

testMCP()
  .then(() => {
    console.log("Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });
