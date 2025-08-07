import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-config";
import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { z } from "zod";
import path from "path";

// Schema for chat request
const ChatRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  conversationId: z.string().optional().nullable(),
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// MCP Client management - using modern approach
class MCPClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private isConnected = false;

  async connect() {
    if (this.isConnected && this.client) {
      console.log("Reusing existing MCP client");
      return this.client;
    }

    try {
      // Path to the MCP server
      const serverPath = path.join(process.cwd(), "mcp-server.js");
      console.log("Starting MCP server at:", serverPath);

      // Create transport and client
      this.transport = new StdioClientTransport({
        command: "node",
        args: [serverPath],
      });

      this.client = new Client(
        {
          name: "admin-client",
          version: "1.0.0",
        },
        {
          capabilities: {},
        },
      );

      console.log("Connecting to MCP server...");
      await this.client.connect(this.transport);
      this.isConnected = true;
      console.log("Connected to MCP server");

      // Wait a moment for the server to be fully ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      return this.client;
    } catch (error) {
      console.error("Failed to connect to MCP server:", error);
      this.isConnected = false;
      throw error;
    }
  }

  async setAuth(headers: Record<string, string>) {
    if (!this.client) {
      throw new Error("Client not connected");
    }

    try {
      // For custom auth method, we don't need a schema
      await this.client.request(
        {
          method: "auth/set",
          params: {
            headers,
          },
        },
        null as any,
      );
    } catch (error) {
      console.error("Failed to set auth headers for MCP server:", error);
    }
  }

  async listTools() {
    if (!this.client) {
      throw new Error("Client not connected");
    }

    try {
      return await this.client.listTools();
    } catch (error) {
      console.error("Failed to list tools:", error);
      return { tools: [] };
    }
  }

  async callTool(name: string, args: any) {
    if (!this.client) {
      throw new Error("Client not connected");
    }

    try {
      return await this.client.callTool({
        name,
        arguments: args,
      });
    } catch (error) {
      console.error(`Error calling MCP tool ${name}:`, error);
      throw error;
    }
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
    if (this.transport) {
      await this.transport.close();
      this.transport = null;
    }
    this.isConnected = false;
  }
}

// Single shared client instance
let mcpClient: MCPClient | null = null;

async function getMCPClient() {
  if (!mcpClient) {
    mcpClient = new MCPClient();
  }
  await mcpClient.connect();
  return mcpClient;
}

// Simple in-memory conversation storage
const conversations = new Map<
  string,
  OpenAI.Chat.Completions.ChatCompletionMessageParam[]
>();

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 },
      );
    }

    // Parse request
    const body = await request.json();
    const { message, conversationId } = ChatRequestSchema.parse(body);

    // Generate conversation ID if not provided
    const currentConversationId =
      conversationId ||
      `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get or create conversation history
    if (!conversations.has(currentConversationId)) {
      conversations.set(currentConversationId, [
        {
          role: "system",
          content: `You are an AI assistant for a B2C e-commerce admin dashboard. You have access to various tools that can help you search and analyze data. Use the available tools to provide helpful insights and answer questions about the system. Always be concise but informative in your responses.`,
        },
      ]);
    }

    const conversation = conversations.get(currentConversationId)!;
    conversation.push({ role: "user", content: message });

    // Get tools dynamically from MCP server
    const client = await getMCPClient();

    // Set authentication headers for the MCP server
    try {
      const cookieHeader = request.headers.get("cookie");
      if (cookieHeader) {
        await client.setAuth({
          Cookie: cookieHeader,
        });
      }
    } catch (authError) {
      console.error("Failed to set auth headers for MCP server:", authError);
    }

    console.log("Requesting tools from MCP server...");
    let toolsResponse: any;
    try {
      toolsResponse = await client.listTools();
      console.log("Successfully retrieved tools from MCP server");
    } catch (toolsError) {
      console.error("Failed to get tools from MCP server:", toolsError);
      console.error(
        "Error name:",
        toolsError instanceof Error ? toolsError.name : "Unknown error type",
      );
      // Fallback to empty tools array
      toolsResponse = { tools: [] };
    }

    // Convert MCP tools to OpenAI format
    const tools = (toolsResponse?.tools || []).map((tool: any) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }));

    console.log(`Found ${tools.length} tools from MCP server`);

    if (tools.length === 0) {
      console.warn(
        "No tools received from MCP server, proceeding without tools",
      );
    }

    // Call OpenAI with tools
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversation,
      tools: tools,
      tool_choice: "auto",
      max_tokens: 1000,
    });

    const assistantMessage = completion.choices[0]?.message;

    if (!assistantMessage) {
      throw new Error("No response from OpenAI");
    }

    // Handle tool calls
    if (assistantMessage.tool_calls) {
      const toolResults = [];

      for (const toolCall of assistantMessage.tool_calls) {
        try {
          console.log("Processing tool call:", toolCall);

          let parsedArgs;
          try {
            parsedArgs = toolCall.function.arguments
              ? JSON.parse(toolCall.function.arguments)
              : {};
          } catch (parseError) {
            console.error(
              "Failed to parse tool arguments:",
              toolCall.function.arguments,
            );
            throw new Error(`Invalid tool arguments: ${parseError}`);
          }

          const result = await client.callTool(
            toolCall.function.name,
            parsedArgs,
          );

          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool" as const,
            content: String(
              typeof result === "object" &&
                result &&
                "content" in result &&
                Array.isArray(result.content) &&
                result.content[0] &&
                "text" in result.content[0]
                ? result.content[0].text
                : JSON.stringify(result),
            ),
          });
        } catch (error) {
          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool" as const,
            content: `Error: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      }

      // Add tool call and results to conversation
      conversation.push(assistantMessage);
      conversation.push(...toolResults);

      // Get final response from OpenAI
      const finalCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: conversation,
        max_tokens: 1000,
      });

      const finalMessage =
        finalCompletion.choices[0]?.message?.content ||
        "I couldn't process that request.";

      conversation.push({
        role: "assistant",
        content: finalMessage,
      });

      return NextResponse.json({
        success: true,
        response: finalMessage,
        conversationId: currentConversationId,
      });
    } else {
      // No tool calls, direct response
      const responseContent =
        assistantMessage.content || "I couldn't process that request.";
      conversation.push({ role: "assistant", content: responseContent });

      return NextResponse.json({
        success: true,
        response: responseContent,
        conversationId: currentConversationId,
      });
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 },
    );
  }
}

// Cleanup function for MCP client
process.on("SIGINT", async () => {
  if (mcpClient) {
    await mcpClient.close();
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  if (mcpClient) {
    await mcpClient.close();
  }
  process.exit(0);
});
