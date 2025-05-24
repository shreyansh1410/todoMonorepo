import { prismaClient } from "@repo/db/client";
import { Suspense } from "react";
import { revalidatePath } from "next/cache";
import styles from "./page.module.css";

type User = {
  id: string;
  email: string;
};

type TodoWithUser = {
  id: string;
  task: string;
  done: boolean;
  userId: string;
  user: {
    email: string;
  };
};

async function toggleTodo(todoId: string, currentStatus: boolean) {
  "use server";

  try {
    await prismaClient.todo.update({
      where: { id: todoId },
      data: { done: !currentStatus },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to toggle todo:", error);
  }
}

function Loading() {
  return (
    <div className={styles.loading}>
      <p>Loading...</p>
    </div>
  );
}

async function UserList() {
  try {
    const users = await prismaClient.user.findMany({
      orderBy: {
        email: "asc",
      },
    });

    if (users.length === 0) {
      return (
        <div className={styles.empty}>
          <p>No users found.</p>
        </div>
      );
    }

    return (
      <div className={styles.userList}>
        {users.map((user: User) => (
          <div key={user.id} className={styles.userItem}>
            <p>{user.email}</p>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error("Database connection error:", error);
    return (
      <div className={styles.error}>
        <p>Failed to fetch users.</p>
        <pre>{error instanceof Error ? error.message : "Unknown error"}</pre>
      </div>
    );
  }
}

// Server component to fetch todos from database
async function TodoList() {
  try {
    const todos = await prismaClient.todo.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    if (todos.length === 0) {
      return (
        <div className={styles.empty}>
          <p>No todos found.</p>
        </div>
      );
    }

    return (
      <div className={styles.todoList}>
        {todos.map((todo: TodoWithUser) => (
          <div
            key={todo.id}
            className={`${styles.todoItem} ${todo.done ? styles.completed : ""}`}
          >
            <div className={styles.todoContent}>
              <h3>{todo.task}</h3>
              <p>User: {todo.user.email}</p>
            </div>
            <div className={styles.todoActions}>
              <div className={styles.todoStatus}>
                {todo.done ? (
                  <span className={styles.doneLabel}>✓ Completed</span>
                ) : (
                  <span className={styles.pendingLabel}>⏳ Pending</span>
                )}
              </div>
              <form action={toggleTodo.bind(null, todo.id, todo.done)}>
                <button
                  type="submit"
                  className={`${styles.toggleButton} ${todo.done ? styles.undoButton : styles.completeButton}`}
                >
                  {todo.done ? "Mark Undone" : "Mark Done"}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error("Database connection error:", error);
    return (
      <div className={styles.error}>
        <p>Failed to fetch todos.</p>
        <pre>{error instanceof Error ? error.message : "Unknown error"}</pre>
      </div>
    );
  }
}

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>Todo App</h1>
        <p className={styles.subtitle}>Users and Todos</p>

        <div className={styles.columns}>
          <div className={styles.column}>
            <h2>Users</h2>
            <Suspense fallback={<Loading />}>
              <UserList />
            </Suspense>
          </div>

          <div className={styles.column}>
            <h2>Todos</h2>
            <Suspense fallback={<Loading />}>
              <TodoList />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

//this page will not generate statically
export const dynamic = "force-dynamic";