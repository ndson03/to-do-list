import React from 'react';
import { useDispatch } from 'react-redux';
import { setSearchTerm } from '../redux/slices/filterSlice';

function SearchBar() {
  const dispatch = useDispatch();

  const handleSearchChange = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  return (
    <input
      type="text"
      placeholder="Search tasks..."
      onChange={handleSearchChange}
      className='search-bar'
    />
  );
}

export default SearchBar;