import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectFilteredTasksByStatus } from "../redux/taskSelectors";
import { fetchTasks } from "../redux/slices/taskSlice";
import Task from "./Task";
import Pagination from "./Pagination";
import { openTaskForm } from "../redux/slices/uiSlice";
import { ReactSortable } from "react-sortablejs";

const TASKS_PER_PAGE = 5;

function TaskColumn({ status, onSortEnd }) {
  const dispatch = useDispatch();
  const tasks = useSelector((state) =>
    selectFilteredTasksByStatus(state, status)
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const currentTasks = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * TASKS_PER_PAGE;
    const lastPageIndex = firstPageIndex + TASKS_PER_PAGE;
    // Sắp xếp tasks theo trường `order`
    const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);
    return sortedTasks.slice(firstPageIndex, lastPageIndex);
  }, [tasks, currentPage]);

  // Tạo bản sao có thể mở rộng của currentTasks cho ReactSortable
  const sortableTasks = useMemo(() => {
    return currentTasks.map((task) => ({ ...task }));
  }, [currentTasks]);

  const totalPages = Math.ceil(tasks.length / TASKS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAddTask = () => {
    dispatch(openTaskForm());
  };

  return (
    <div 
      className="task-column" 
      id={status}
      data-current-page={currentPage} // Thêm data attribute
    >
      <h2>
        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {status.toUpperCase()}
          {status === "todo" && (
            <div>
              <button className="add-task-btn" onClick={handleAddTask}>
                Add Task
              </button>
            </div>
          )}
        </div>
        <span className="task-count">{tasks.length}</span>
      </h2>
      <ReactSortable
        list={sortableTasks}
        setList={() => {}}
        group="tasks"
        animation={150}
        onEnd={(evt) => onSortEnd(evt)} // Bỏ status và currentPage
        className="task-container"
      >
        {currentTasks.map((task) => (
          <Task key={task.id} task={task} />
        ))}
      </ReactSortable>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default TaskColumn;
