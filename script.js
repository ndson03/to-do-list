const API_URL = "http://localhost:3000/tasks";

function showPopup() {
  document.getElementById("task-popup").style.display = "flex";
  document.getElementById("task-title").focus();
}

function closePopup() {
  document.getElementById("task-popup").style.display = "none";
  document.getElementById("task-title").value = "";
  document.getElementById("task-description").value = "";
}

async function fetchTasks(status = "") {
  try {
    const url = status
      ? `${API_URL}?status=${status}&_sort=order`
      : `${API_URL}?_sort=order`;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}

async function renderTasks() {
  const columns = {
    todo: document.getElementById("todo").querySelector(".task-container"),
    inprogress: document
      .getElementById("inprogress")
      .querySelector(".task-container"),
    done: document.getElementById("done").querySelector(".task-container"),
  };

  const [todoTasks, inprogressTasks, doneTasks] = await Promise.all([
    fetchTasks("todo"),
    fetchTasks("inprogress"),
    fetchTasks("done"),
  ]);

  Object.values(columns).forEach((column) => {
    column.querySelectorAll(".task").forEach((task) => task.remove());
  });

  [todoTasks, inprogressTasks, doneTasks].forEach((tasks, index) => {
    const status = ["todo", "inprogress", "done"][index];
    const column = columns[status];
    const countElement = document.querySelector(`#${status}-count`);
    countElement.textContent = tasks.length;

    tasks.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.className = "task";
      taskElement.dataset.id = task.id;
      taskElement.innerHTML = `
                        <div class="task-title">${
                          task.title || "Untitled"
                        }</div>
                        <div class="task-description">${
                          task.description || ""
                        }</div>
                        <div class="task-created">${
                          task.createdAt
                            ? new Date(task.createdAt).toLocaleString("en-GB", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : ""
                        }</div>
                        <button class="delete-btn" onclick="deleteTask('${
                          task.id
                        }')">✕</button>
                    `;
      column.appendChild(taskElement);
    });
  });
}

async function addTask() {
  const title = document.getElementById("task-title").value.trim();
  const description = document.getElementById("task-description").value.trim();
  if (!title) return alert("Title is required");

  const todoTasks = await fetchTasks("todo");
  const newOrder = todoTasks.length
    ? Math.max(...todoTasks.map((t) => t.order || 0)) + 1
    : 0;

  const newTask = {
    id: Date.now().toString(),
    title,
    description,
    status: "todo",
    order: newOrder,
    createdAt: new Date().toISOString(),
  };

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    closePopup();
    await renderTasks();
  } catch (error) {
    console.error("Error adding task:", error);
  }
}

async function deleteTask(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa task này?")) return;
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    await renderTasks();
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

async function updateTask(id, status, order) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, order }),
    });
  } catch (error) {
    console.error("Error updating task:", error);
  }
}

async function updateColumnOrder(column) {
  const tasks = Array.from(column.querySelectorAll(".task"));
  const status = column.parentElement.dataset.status;

  const updates = tasks.map((task, index) => {
    const taskId = task.dataset.id;
    return updateTask(taskId, status, index);
  });

  await Promise.all(updates);
}

document.querySelectorAll(".task-column .task-container").forEach((column) => {
  new Sortable(column, {
    group: "tasks",
    animation: 150,
    ghostClass: "sortable-ghost",
    onEnd: async function (evt) {
      const taskId = evt.item.dataset.id;
      const toColumn = evt.to;
      const fromColumn = evt.from;
      const newStatus = toColumn.parentElement.dataset.status;

      await updateTask(taskId, newStatus, evt.newIndex);
      await updateColumnOrder(toColumn);
      if (fromColumn !== toColumn) {
        await updateColumnOrder(fromColumn);
      }
      await renderTasks();
    },
  });
});

renderTasks();
