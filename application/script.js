const API_URL = "/api/tasks";

const form = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const message = document.getElementById("message");

async function api(path = "", options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

function showMessage(text) {
  message.textContent = text;
}

function renderTasks(tasks) {
  taskList.replaceChildren();
  taskCount.textContent = `${tasks.length} task${tasks.length === 1 ? "" : "s"}`;

  if (tasks.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No tasks yet. Add your first task above!";
    taskList.appendChild(empty);
    return;
  }

  tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  for (const task of tasks) {
    const card = document.createElement("article");
    card.className = `task-card${task.completed ? " completed" : ""}`;

    const info = document.createElement("div");
    info.className = "task-info";

    const heading = document.createElement("h3");
    heading.textContent = task.title;

    const description = document.createElement("p");
    description.textContent = task.description || "No description";

    info.append(heading, description);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const completeButton = document.createElement("button");
    completeButton.textContent = task.completed ? "Undo" : "Complete";
    completeButton.addEventListener("click", async () => {
      try {
        await api(`/${encodeURIComponent(task.id)}`, {
          method: "PUT",
          body: JSON.stringify({ completed: !task.completed }),
        });
        await loadTasks();
        showMessage("Task status updated.");
      } catch (error) {
        showMessage(error.message);
      }
    });

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", async () => {
      const title = prompt("Edit task title:", task.title);
      if (title === null) return;
      if (!title.trim()) {
        showMessage("Task title cannot be empty.");
        return;
      }

      const description = prompt("Edit description:", task.description || "");
      if (description === null) return;

      try {
        await api(`/${encodeURIComponent(task.id)}`, {
          method: "PUT",
          body: JSON.stringify({
            title: title.trim(),
            description,
          }),
        });
        await loadTasks();
        showMessage("Task updated.");
      } catch (error) {
        showMessage(error.message);
      }
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete";
    deleteButton.addEventListener("click", async () => {
      if (!confirm(`Delete "${task.title}"?`)) return;

      try {
        await api(`/${encodeURIComponent(task.id)}`, {
          method: "DELETE",
        });
        await loadTasks();
        showMessage("Task deleted.");
      } catch (error) {
        showMessage(error.message);
      }
    });

    actions.append(completeButton, editButton, deleteButton);
    card.append(info, actions);
    taskList.appendChild(card);
  }
}

async function loadTasks() {
  try {
    const tasks = await api();
    renderTasks(tasks);
  } catch (error) {
    taskList.replaceChildren();
    const errorText = document.createElement("p");
    errorText.className = "empty-state";
    errorText.textContent = "Could not load tasks. Check your deployment and try again.";
    taskList.appendChild(errorText);
    showMessage(error.message);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    showMessage("Please enter a task title.");
    return;
  }

  try {
    await api("", {
      method: "POST",
      body: JSON.stringify({
        title,
        description: descriptionInput.value.trim(),
      }),
    });

    form.reset();
    await loadTasks();
    showMessage("Task added successfully!");
    titleInput.focus();
  } catch (error) {
    showMessage(error.message);
  }
});

loadTasks();