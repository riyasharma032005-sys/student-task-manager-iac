const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function page(env) {
  return new Response(env.APP_HTML, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (path === "/") {
      return page(env);
    }

    if (path === "/style.css") {
      return new Response(env.APP_CSS, {
        headers: { "Content-Type": "text/css; charset=utf-8" },
      });
    }

    if (path === "/script.js") {
      return new Response(env.APP_JS, {
        headers: { "Content-Type": "application/javascript; charset=utf-8" },
      });
    }

    if (path === "/api/tasks" && request.method === "GET") {
      const list = await env.TASKS_KV.list({ prefix: "task:" });
      const tasks = await Promise.all(
        list.keys.map(async (key) =>
          JSON.parse(await env.TASKS_KV.get(key.name))
        )
      );
      return json(tasks);
    }

    if (path === "/api/tasks" && request.method === "POST") {
      const body = await request.json();

      if (typeof body.title !== "string" || !body.title.trim()) {
        return json({ error: "Task title is required" }, 400);
      }

      const task = {
        id: crypto.randomUUID(),
        title: body.title.trim(),
        description: typeof body.description === "string" ? body.description : "",
        completed: false,
        createdAt: new Date().toISOString(),
      };

      await env.TASKS_KV.put(`task:${task.id}`, JSON.stringify(task));
      return json(task, 201);
    }

    const match = path.match(/^\/api\/tasks\/([^/]+)$/);

    if (match) {
      const key = `task:${match[1]}`;
      const saved = await env.TASKS_KV.get(key);

      if (!saved) return json({ error: "Task not found" }, 404);

      if (request.method === "GET") return json(JSON.parse(saved));

      if (request.method === "PUT") {
        const body = await request.json();
        const task = JSON.parse(saved);

        if (typeof body.title === "string" && body.title.trim()) {
          task.title = body.title.trim();
        }
        if (typeof body.description === "string") {
          task.description = body.description;
        }
        if (typeof body.completed === "boolean") {
          task.completed = body.completed;
        }

        await env.TASKS_KV.put(key, JSON.stringify(task));
        return json(task);
      }

      if (request.method === "DELETE") {
        await env.TASKS_KV.delete(key);
        return json({ message: "Task deleted" });
      }

      return json({ error: "Method not allowed" }, 405);
    }

    return json({ error: "Not found" }, 404);
  },
};