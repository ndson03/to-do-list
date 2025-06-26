import { createSelector } from '@reduxjs/toolkit';

// Selector để lấy toàn bộ tasks
export const selectAllTasks = (state) => state.tasks.tasks;

// Selector để lấy tasks theo status (todo, inprogress, done)
export const selectTasksByStatus = (state, status) => {
  return selectAllTasks(state).filter(task => task.status === status);
};

// Selector để lấy một task theo ID
export const selectTaskById = (state, taskId) => {
  return selectAllTasks(state).find(task => task.id === taskId);
};

// Selector để tìm kiếm tasks
export const selectFilteredTasks = createSelector(
  [selectAllTasks, (state) => state.filter.searchTerm],
  (tasks, searchTerm) => {
    if (!searchTerm) {
      return tasks;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return tasks.filter(task =>
      task.title.toLowerCase().includes(lowerSearchTerm) ||
      task.description.toLowerCase().includes(lowerSearchTerm)
    );
  }
);

// Selector để lấy tasks theo status và đã filter
export const selectFilteredTasksByStatus = (state, status) => {
    const allTasks = selectFilteredTasks(state);
    return allTasks.filter(task => task.status === status);
};