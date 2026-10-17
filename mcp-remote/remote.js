
import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";

import { z } from "zod";

const API_BASE =
  "https://student-task-manager.riyasharma032005.workers.dev";

function createServer() {
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
  const errorBody = await response.text();
  throw new Error(
    `Task API returned HTTP ${response.status} at ${response.url}: ${errorBody}`
  );
}

      const tasks = await response.json();

      return {
        content: [
          { type: "text", text: JSON.stringify(tasks, null, 2) },
        ],
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
        content: [
          { type: "text", text: JSON.stringify(result, null, 2) },
        ],
      };
    }
  );

  return server;
}

export default {
  fetch: createMcpHandler(createServer),
};
