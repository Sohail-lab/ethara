export default function StatusBadge({ status }) {
  const map = {
    todo: "badge-todo",
    "in-progress": "badge-in-progress",
    done: "badge-done",
  };
  return <span className={`badge ${map[status] || "badge-todo"}`}>{status}</span>;
}
