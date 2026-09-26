import { DatabaseSync } from 'node:sqlite';
import type { Todo } from './models/todo.ts';

// SQLite-backed storage (Node's built-in node:sqlite — no extra dependency).
// Defaults to :memory: for local dev / tests; set TODO_DB_PATH to a real
// file path in production so todos survive a restart.
const DEFAULT_DB_PATH = process.env.TODO_DB_PATH || ':memory:';

interface TodoRow {
  id: string;
  title: string;
  completed: number;
  created_at: string;
}

export class TodoDatabase {
  private db: DatabaseSync;

  constructor(dbPath: string = DEFAULT_DB_PATH) {
    this.db = new DatabaseSync(dbPath);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      )
    `);

    const row = this.db.prepare('SELECT COUNT(*) AS count FROM todos').get() as { count: number };
    if (row.count === 0) {
      this.create('Learn Node.js modernization');
    }
  }

  private rowToTodo(row: TodoRow): Todo {
    return {
      id: row.id,
      title: row.title,
      completed: Boolean(row.completed),
      createdAt: new Date(row.created_at),
    };
  }

  getAll(): Todo[] {
    const rows = this.db.prepare('SELECT * FROM todos ORDER BY created_at').all() as unknown as TodoRow[];
    return rows.map((r) => this.rowToTodo(r));
  }

  getById(id: string): Todo | undefined {
    const row = this.db.prepare('SELECT * FROM todos WHERE id = ?').get(id) as TodoRow | undefined;
    return row ? this.rowToTodo(row) : undefined;
  }

  create(title: string): Todo {
    const todo: Todo = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date(),
    };
    this.db
      .prepare('INSERT INTO todos (id, title, completed, created_at) VALUES (?, ?, ?, ?)')
      .run(todo.id, todo.title, todo.completed ? 1 : 0, todo.createdAt.toISOString());
    return todo;
  }

  update(id: string, updates: { title?: string; completed?: boolean }): Todo | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;
    const updated: Todo = { ...existing, ...updates };
    this.db
      .prepare('UPDATE todos SET title = ?, completed = ? WHERE id = ?')
      .run(updated.title, updated.completed ? 1 : 0, id);
    return updated;
  }

  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM todos WHERE id = ?').run(id);
    return result.changes > 0;
  }

  /** Close the underlying connection — mainly useful in tests. */
  close(): void {
    this.db.close();
  }
}

export const db = new TodoDatabase();
