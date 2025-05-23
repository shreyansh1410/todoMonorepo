import express from "express";
import cors from "cors";
import { prismaClient } from "@repo/db/client";

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await prismaClient.user.findMany({
      include: {
        todos: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new user
app.post("/users", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prismaClient.user.create({
      data: {
        email,
        password,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all todos
app.get("/todos", async (req, res) => {
  try {
    const todos = await prismaClient.todo.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get todos for a specific user
app.get("/users/:userId/todos", async (req, res) => {
  try {
    const { userId } = req.params;
    const todos = await prismaClient.todo.findMany({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    res.json(todos);
  } catch (error) {
    console.error("Error fetching user todos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new todo
app.post("/todos", async (req, res) => {
  try {
    const { task, userId, done } = req.body;

    if (!task || !userId) {
      return res.status(400).json({ error: "Task and userId are required" });
    }

    // Verify user exists
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const todo = await prismaClient.todo.create({
      data: {
        task,
        userId,
        done: done ?? false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    res.status(201).json(todo);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a todo
app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { task, done } = req.body;

    const todo = await prismaClient.todo.update({
      where: { id },
      data: {
        ...(task !== undefined && { task }),
        ...(done !== undefined && { done }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    res.json(todo);
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a todo
app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prismaClient.todo.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
