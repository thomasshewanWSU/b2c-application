# AI Chatbot with MCP Integration

This admin dashboard now includes an AI-powered chatbot that can help you query and manage your database using natural language.

## Features

- **Natural Language Interface**: Ask questions in plain English about users and orders
- **Database Integration**: Connects to your existing API endpoints through MCP (Model Context Protocol)
- **Real-time Chat**: Floating chat widget available on all admin pages
- **OpenAI Powered**: Uses GPT models for intelligent responses

## Available Tools

The chatbot has access to the following tools:

1. **Search Users**: Find users by name, email, or other criteria
2. **Search Orders**: Look up specific orders or filter by various parameters

## Setup Instructions

### 1. Get an OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key

### 2. Configure Environment Variables

Update your `.env.local` file with your OpenAI API key:

```bash
OPENAI_API_KEY=your-actual-openai-api-key-here
```

### 3. Start the MCP Server

The MCP server needs to run alongside your main application. In a separate terminal:

```bash
cd apps/admin
node mcp-server.js
```

### 4. Start the Admin Application

```bash
# From the root directory
pnpm dev
```

The admin app will be available at `http://localhost:3001` with the chatbot active.

## Usage Examples

### Searching Users

- "Find all users with the name John"
- "Show me users registered in the last week"
- "Search for users with email containing gmail"

### Searching Orders

- "Find order #12345"
- "Show me all pending orders"
- "Search for orders from user ID 123"

## Architecture

### Components

- **Chatbot.tsx**: React component providing the chat interface
- **route.ts**: API endpoint handling chat requests and OpenAI integration
- **mcp-server.js**: Local MCP server providing database access tools

### Data Flow

1. User types message in chat interface
2. Frontend sends request to `/api/chat`
3. Chat API initializes OpenAI client and MCP connection
4. OpenAI determines if tools are needed and calls MCP server
5. MCP server executes database queries via existing API endpoints
6. Results are formatted and returned to user

## Troubleshooting

### Common Issues

1. **"API key not configured"**

   - Ensure `OPENAI_API_KEY` is set in `.env.local`
   - Restart the development server after adding the key

2. **"MCP server connection failed"**

   - Make sure the MCP server is running (`node mcp-server.js`)
   - Check that port 3002 is not being used by another process

3. **"No response from chatbot"**
   - Check browser console for JavaScript errors
   - Verify API routes are accessible at `/api/chat`

### Development Notes

- The MCP server runs on a separate process and connects via stdio
- OpenAI API calls are made server-side for security
- All database access goes through existing authenticated API routes

## Security Considerations

- OpenAI API key is kept server-side only
- Database access uses existing authentication and authorization
- No direct database queries from the chatbot - all access via API routes
