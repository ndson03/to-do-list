import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTasks,
  updateTask,
  reorderTasks,
} from "../redux/slices/taskSlice";
import TaskColumn from "../components/TaskColumn";
import TaskForm from "../components/TaskForm";
import SearchBar from "../components/SearchBar";

function TodoList() {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.ui.loading);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleSortEnd = (evt) => {
    const { oldIndex, newIndex, item, from, to } = evt;
    const taskId = item.id;
    const newStatus = to.parentElement.id;
    
    // Lấy currentPage của thằng đích từ data attribute
    const targetPage = parseInt(to.parentElement.dataset.currentPage) || 1;
    
    if (from === to && oldIndex === newIndex) {
      return;
    }

    // Tính toán real index dựa trên pagination của thằng đích
    const TASKS_PER_PAGE = 5;
    const realNewIndex = (targetPage - 1) * TASKS_PER_PAGE + newIndex;
    
    console.log('Target page:', targetPage);
    console.log('Real new index:', realNewIndex);

    if (from !== to) {
      // Di chuyển sang cột khác: cập nhật status trước, sau đó reorder
      dispatch(updateTask({ id: taskId, status: newStatus }))
        .then(() => {
          dispatch(reorderTasks({
            status: newStatus,
            taskId,
            newIndex: realNewIndex
          }));
        });
    } else {
      // Di chuyển trong cùng cột: chỉ cần reorder
      dispatch(reorderTasks({
        status: newStatus,
        taskId,
        newIndex: realNewIndex
      }));
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="">
      <h1 className="page-title">To Do List</h1>
      <SearchBar />
      <div className="task-board">
        <TaskColumn status="todo" onSortEnd={handleSortEnd} />
        <TaskColumn status="inprogress" onSortEnd={handleSortEnd} />
        <TaskColumn status="done" onSortEnd={handleSortEnd} />
      </div>
      <TaskForm />
    </div>
  );
}

export default TodoList;
