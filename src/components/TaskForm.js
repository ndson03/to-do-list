import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTask, updateTask } from '../redux/slices/taskSlice';
import { closeTaskForm } from '../redux/slices/uiSlice';
import { selectTaskById } from '../redux/taskSelectors';

function TaskForm() {
  const dispatch = useDispatch();
  const isTaskFormOpen = useSelector((state) => state.ui.isTaskFormOpen);
  const taskIdForEdit = useSelector((state) => state.ui.taskIdForEdit);
  const taskToEdit = useSelector(state => selectTaskById(state, taskIdForEdit));

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [taskToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    if (taskIdForEdit) {
      // Edit existing task
      dispatch(updateTask({ id: taskIdForEdit, title, description }));
    } else {
      // Add new task
      const newTask = {
        title: title.trim(),
        description: description.trim(),
        status: 'todo',  // Mặc định là "todo"
        createdAt: new Date().toISOString(),
      };
      dispatch(addTask(newTask), {dispatch});
    }

    dispatch(closeTaskForm());
  };

  const handleClose = () => {
    dispatch(closeTaskForm());
  };

  if (!isTaskFormOpen) {
    return null;
  }

  return (
    <div className='popup'>
      <div className='popup-content'>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            id="task-title"
            placeholder="Task title"
            maxLength="100"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            id="task-description"
            placeholder="Task description"
            maxLength="500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className='popup-button'>
            <button type="submit" className='add-task'>
              {taskIdForEdit ? 'Save' : 'Add Task'}
            </button>
            <button type="button" className='close-popup' onClick={handleClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;