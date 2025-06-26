import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isTaskFormOpen: false,
  taskIdForEdit: null,
  loading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openTaskForm: (state, action) => {
      state.isTaskFormOpen = true;
      state.taskIdForEdit = action.payload || null; // Nếu có taskId, là edit
    },
    closeTaskForm: (state) => {
      state.isTaskFormOpen = false;
      state.taskIdForEdit = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { openTaskForm, closeTaskForm, setLoading } = uiSlice.actions;

export default uiSlice.reducer;
