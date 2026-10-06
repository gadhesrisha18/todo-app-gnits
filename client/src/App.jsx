import { useEffect, useState } from "react";
import { getTodos, createTodo, updateTodo, deleteTodo } from "./api";
import { FILTERS } from "./filters";
import Sidebar from "./components/Sidebar";
import TodoForm from "./components/TodoForm";
import TodoItem from "./components/TodoItem";

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;

  // Shows an error in the banner
  function showError(err) {
    console.error(err);
    setError(err.message);
  }

  // Load all todos once when the page opens
  useEffect(() => {
    async function loadTodos() {
      try {
        setError("");
        const data = await getTodos();
        setTodos(data);
      } catch (err) {
        showError(err);
      } finally {
        setLoading(false);
      }
    }

    loadTodos();
  }, []);

  // Add a new todo
  async function handleAdd(title) {
    try {
      setError("");
      const newTodo = await createTodo(title);

      setTodos((prev) => [newTodo, ...prev]);

      // Show the newly added task on page 1
      setCurrentPage(1);
    } catch (err) {
      showError(err);
    }
  }

  // Update a todo
  async function handleUpdate(id, data) {
    try {
      setError("");

      const updated = await updateTodo(id, data);

      setTodos((prev) =>
        prev.map((todo) => (todo._id === id ? updated : todo))
      );
    } catch (err) {
      showError(err);
    }
  }

  // Delete one todo
  async function handleDelete(id) {
    try {
      setError("");

      await deleteTodo(id);

      setTodos((prev) => prev.filter((todo) => todo._id !== id));
    } catch (err) {
      showError(err);
    }
  }

  // Remove every completed todo
  async function handleClearDone() {
    try {
      setError("");

      const doneTodos = todos.filter((todo) => todo.completed);

      for (const todo of doneTodos) {
        await deleteTodo(todo._id);
      }

      setTodos((prev) => prev.filter((todo) => !todo.completed));

      // Go back to page 1
      setCurrentPage(1);
    } catch (err) {
      showError(err);
    }
  }

  // Only todos that match the selected filter
  const filteredTodos = todos.filter(FILTERS[filter].test);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTodos.length / tasksPerPage);

  const startIndex = (currentPage - 1) * tasksPerPage;

  const currentTodos = filteredTodos.slice(
    startIndex,
    startIndex + tasksPerPage
  );

  // If deleting tasks makes the current page invalid,
  // automatically move to the last available page.
  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
    } else if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // "1 task" or "3 tasks"
  const taskWord = filteredTodos.length === 1 ? "task" : "tasks";

  // Change filter and return to page 1
  function handleFilterChange(newFilter) {
    setFilter(newFilter);
    setCurrentPage(1);
  }

  // Decide what to show in the list area
  function renderTodos() {
    if (loading) {
      return <p className="empty">Loading...</p>;
    }

    if (filteredTodos.length === 0) {
      let message = "You're all caught up. Add a task above.";

      if (filter === "done") {
        message = "Nothing completed yet";
      }

      return (
        <div className="empty">
          <img src="/logo.png" alt="" />
          <p>{message}</p>
        </div>
      );
    }

    return (
      <>
        <ul className="todo-list">
          {currentTodos.map((todo) => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </ul>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            {/* First page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              aria-label="First page"
            >
              «
            </button>

            {/* Previous page */}
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              ‹
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;

              return (
                <button
                  key={pageNumber}
                  className={
                    currentPage === pageNumber ? "active" : ""
                  }
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}

            {/* Next page */}
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              ›
            </button>

            {/* Last page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last page"
            >
              »
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="layout">
      <Sidebar
        todos={todos}
        filter={filter}
        onFilter={handleFilterChange}
        onClearDone={handleClearDone}
      />

      <main className="panel content">
        <header className="content-header">
          <h2>{FILTERS[filter].label}</h2>

          <span className="content-count">
            {filteredTodos.length} {taskWord}
          </span>
        </header>

        <TodoForm onAdd={handleAdd} />

        {error && (
          <div className="error" role="alert">
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {renderTodos()}
      </main>
    </div>
  );
}

export default App;