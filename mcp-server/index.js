
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE =
  process.env.TASK_API_URL ||
  "https://student-task-manager.riyasharma032005.workers.dev";

const server = new McpServer({
  name: "student-task-manager",
  version: "1.0.0",
});

server.registerTool(
  "list_tasks",
  {
    description: "List all tasks in the Student Task Manager",
    inputSchema: {},
  },
  async () => {
    const response = await fetch(`${API_BASE}/api/tasks`);
    if (!response.ok) {
      throw new Error(`Task API returned HTTP ${response.status}`);
    }

    const tasks = await response.json();
    return {
      content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }],
    };
  }
);

server.registerTool(
  "add_task",
  {
    description: "Add a task to the Student Task Manager",
    inputSchema: {
      title: z.string().min(1).describe("Task title"),
      description: z.string().optional().describe("Optional task description"),
    },
  },
  async ({ title, description = "" }) => {
    const response = await fetch(`${API_BASE}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(JSON.stringify(result));
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
