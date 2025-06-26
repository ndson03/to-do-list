import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchTerm: '',
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
  },
});

export const { setSearchTerm } = filterSlice.actions;

export default filterSlice.reducer;