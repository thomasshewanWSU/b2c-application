import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

// MCP Client Pool for handling multiple concurrent requests
// Following the official MCP documentation patterns
class MCPClientPool {
  private clients: Array<{
    client: Client;
    transport: StdioClientTransport;
    inUse: boolean;
    authHash?: string;
  }> = [];
  private maxClients = 5; // Adjust based on your needs

  private hashAuth(headers: Record<string, string>): string {
    return JSON.stringify(headers);
  }

  async getClient(authHeaders?: Record<string, string>): Promise<{
    client: Client;
    release: () => void;
  }> {
    const authHash = authHeaders ? this.hashAuth(authHeaders) : undefined;

    // Look for available client with matching auth
    let clientEntry = this.clients.find(
      (entry) => !entry.inUse && entry.authHash === authHash
    );

    if (!clientEntry && this.clients.length < this.maxClients) {
      // Create new client
      clientEntry = await this.createClient(authHeaders, authHash);
      this.clients.push(clientEntry);
    } else if (!clientEntry) {
      // Wait for a client to become available
      await new Promise((resolve) => setTimeout(resolve, 100));
      return this.getClient(authHeaders);
    }

    clientEntry.inUse = true;

    return {
      client: clientEntry.client,
      release: () => {
        clientEntry!.inUse = false;
      },
    };
  }

  private async createClient(
    authHeaders?: Record<string, string>,
    authHash?: string
  ) {
    const serverPath = path.join(process.cwd(), "mcp-server.js");

    // For STDIO transport, pass auth through environment variables
    // as recommended by the MCP specification
    const env: Record<string, string> = {};
    Object.entries(process.env).forEach(([key, value]) => {
      if (value !== undefined) {
        env[key] = value;
      }
    });

    if (authHeaders) {
      env.MCP_AUTH_HEADERS = JSON.stringify(authHeaders);
    }

    const transport = new StdioClientTransport({
      command: "node",
      args: [serverPath],
      env,
    });

    // Initialize client following the official documentation
    const client = new Client(
      {
        name: "admin-client-pool",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    await client.connect(transport);

    return {
      client,
      transport,
      inUse: false,
      authHash,
    };
  }

  async shutdown() {
    await Promise.all(
      this.clients.map(async (entry) => {
        try {
          await entry.client.close();
        } catch (error) {
          console.error("Error closing MCP client:", error);
        }
      })
    );
    this.clients = [];
  }
}

export { MCPClientPool };
