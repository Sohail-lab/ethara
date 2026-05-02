import StatusBadge from "./StatusBadge";
import "./TaskCard.css";

function isOverdue(due_date, status) {
  if (!due_date || status === "done") return false;
  return new Date(due_date) < new Date();
}

export default function TaskCard({ task, onStatusChange, currentUser }) {
  const overdue = isOverdue(task.due_date, task.status);
  const canEdit = currentUser?.role === "admin" || task.assigned_to === currentUser?.id;

  return (
    <div className={`task-card ${overdue ? "task-card--overdue" : ""}`}>
      <div className="task-card-top">
        <span className="task-title">{task.title}</span>
        <StatusBadge status={task.status} />
      </div>
      {task.description && <p className="task-desc">{task.description}</p>}
      <div className="task-card-footer">
        <div className="task-meta">
          {task.due_date && (
            <span className={`task-due ${overdue ? "task-due--late" : ""}`}>
              {overdue ? "⚠ " : "📅 "}
              {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
          {task.assigned_to && (
            <span className="task-assigned">Assignee #{task.assigned_to}</span>
          )}
        </div>
        {canEdit && task.status !== "done" && (
          <select
            className="status-select"
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        )}
      </div>
    </div>
  );
}
