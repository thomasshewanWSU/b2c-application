import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-config";
import OpenAI from "openai";
import { MCPClientPool } from "@/lib/mcp-client-pool";
import { z } from "zod";

// Schema for chat request
const ChatRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  conversationId: z.string().optional().nullable(),
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Shared MCP client pool for handling multiple concurrent requests
const mcpClientPool = new MCPClientPool();

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

    // Get tools dynamically from MCP server using client pool
    const cookieHeader = request.headers.get("cookie");
    const authHeaders = cookieHeader ? { Cookie: cookieHeader } : undefined;
    
    const { client, release } = await mcpClientPool.getClient(authHeaders);

    try {
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

            const result = await client.callTool({
              name: toolCall.function.name,
              arguments: parsedArgs,
            });

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
    } finally {
      // Release the client back to the pool
      release();
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

// Cleanup function for MCP client pool
process.on("SIGINT", async () => {
  await mcpClientPool.shutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await mcpClientPool.shutdown();
  process.exit(0);
});
