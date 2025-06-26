import { useDispatch } from 'react-redux';
import { deleteTask } from '../redux/slices/taskSlice';
import { openTaskForm } from '../redux/slices/uiSlice';

function Task({ task }) {
  const dispatch = useDispatch();

  const handleDelete = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa task này?")) {
      dispatch(deleteTask(task.id));
    }
  };

  const handleEdit = () => {
    dispatch(openTaskForm(task.id)); // Truyền ID để mở form ở chế độ edit
  };

  return (
    <div className='task' id={task.id}>
      <div className='task-content'>
        <div className='task-title'>{task.title || "Untitled"}</div>
        <div className='task-description'>{task.description || ""}</div>
        <div className='task-created'>
          {task.createdAt
            ? new Date(task.createdAt).toLocaleString("en-GB", {
                dateStyle: "short",
                timeStyle: "short",
              })
            : ""}
        </div>
      </div>
      <div className='task-button'>
        <button className='edit-btn' onClick={handleEdit}>
          <i class="far fa-edit"></i>
        </button>
        <button className='delete-btn' onClick={handleDelete}>
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  );
}

export default Task;