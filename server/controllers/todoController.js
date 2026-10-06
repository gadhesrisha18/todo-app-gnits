const Todo = require("../models/Todo");

// GET /api/todos
const getTodos = async (req, res) => {
  // Complete this to get all todo items
    try {
      const todos = await Todo.find();
      res.json(todos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
};

// POST /api/todos
const createTodo = async (req, res) => {
  try {
    // Complete this to add the entry in db
      const todo = new Todo({
        title: req.body.title,
      });
      const savedTodo = await todo.save();
      res.status(201).json(savedTodo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/todos/:id
const updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!todo){
      return res.status(404).json({ message: "Todo not found" });
    }
    res.json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/todos/:id
const deleteTodo = async (req, res) => {
  // Complete this to delete the selected todo item
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };
