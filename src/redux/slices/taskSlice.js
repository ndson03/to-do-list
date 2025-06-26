import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = "http://localhost:3001/tasks";

// Async thunk cho việc fetch tasks từ API
export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async () => {
  const response = await fetch(API_URL);
  const data = await response.json();
  return data;
});

// Async thunk cho việc thêm một task
// Async thunk for adding a task with reordering
export const addTask = createAsyncThunk(
  "tasks/addTaskWithReorder",
  async (task) => {
    // 1. Fetch tasks with the same status
    const response = await fetch(`${API_URL}?status=todo&_sort=order`);
    const tasksInSameStatus = await response.json();

    // 2. Update order for existing tasks
    const updatePromises = tasksInSameStatus.map((existingTask) =>
      fetch(`${API_URL}/${existingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: existingTask.order + 1 }),
      }).then((res) => res.json())
    );

    const updatedExistingTasks = await Promise.all(updatePromises);

    // 3. Add new task
    const taskWithOrder = { ...task, order: 0 };
    const addResponse = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskWithOrder),
    });
    const newTask = await addResponse.json();

    // 4. Return both new task and updated tasks
    return {
      newTask,
      updatedTasks: updatedExistingTasks,
    };
  }
);

// Async thunk cho việc xóa một task
export const deleteTask = createAsyncThunk("tasks/deleteTask", async (id) => {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  return id; // Trả về ID để cập nhật state
});

// Async thunk cho việc cập nhật một task
export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, ...fields }) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fields),
    });
    const data = await response.json();
    return data;
  }
);

export const reorderTasks = createAsyncThunk(
  "tasks/reorderTasks",
  async ({ status, taskId, newIndex }) => {
    // Lấy tất cả tasks của status này từ server
    const response = await fetch(`${API_URL}?status=${status}`);
    const tasks = await response.json();

    // Sắp xếp theo order hiện tại
    const sortedTasks = tasks.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Tìm task được di chuyển và loại bỏ khỏi danh sách
    const movedTask = sortedTasks.find((task) => task.id === taskId);
    const otherTasks = sortedTasks.filter((task) => task.id !== taskId);

    // Chèn task vào vị trí mới
    otherTasks.splice(newIndex, 0, movedTask);

    // Tạo danh sách cập nhật với order mới (0, 1, 2, 3...)
    const updates = otherTasks.map((task, index) => ({
      id: task.id,
      order: index,
    }));

    // Gửi batch update lên server
    const updatePromises = updates.map((update) =>
      fetch(`${API_URL}/${update.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: update.order }),
      }).then((res) => res.json())
    );

    const updatedTasks = await Promise.all(updatePromises);
    return { status, updatedTasks };
  }
);

const initialState = {
  tasks: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        const { newTask, updatedTasks } = action.payload;

        state.tasks.push(newTask);

        updatedTasks.forEach((updatedTask) => {
          const index = state.tasks.findIndex(
            (task) => task.id === updatedTask.id
          );
          if (index !== -1) {
            state.tasks[index] = updatedTask;
          }
        });
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        const index = state.tasks.findIndex(
          (task) => task.id === updatedTask.id
        );
        if (index !== -1) {
          state.tasks[index] = updatedTask;
        }
      })
      .addCase(reorderTasks.fulfilled, (state, action) => {
        const { updatedTasks } = action.payload;
        // Cập nhật order cho các tasks đã được reorder
        updatedTasks.forEach((updatedTask) => {
          const index = state.tasks.findIndex(
            (task) => task.id === updatedTask.id
          );
          if (index !== -1) {
            state.tasks[index] = { ...state.tasks[index], ...updatedTask };
          }
        });
      });
  },
});

export default tasksSlice.reducer;
