import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './slices/taskSlice';
import uiReducer from './slices/uiSlice';
import filterReducer from './slices/filterSlice';

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    ui: uiReducer,
    filter: filterReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(), 
});