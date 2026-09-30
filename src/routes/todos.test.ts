import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Hono } from 'hono';

const API_KEY = 'test-key-123';
process.env.API_KEY = API_KEY;

const { default: todos } = await import('../routes/todos.ts');
const { TodoDatabase } = await import('../db.ts');

// Hono apps can be exercised directly with app.request() — no server needed.
const app = new Hono().route('/api/todos', todos);

const authHeaders = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
};

describe('GET /api/todos', () => {
  test('returns the seeded todo', async () => {
    const res = await app.request('/api/todos');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
  });

  test('filters by completed status', async () => {
    const res = await app.request('/api/todos?completed=true');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.every((t: { completed: boolean }) => t.completed === true));
  });
});

describe('POST /api/todos', () => {
  test('creates a todo when a title is given', async () => {
    const res = await app.request('/api/todos', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ title: 'Write requirements.md' }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.title, 'Write requirements.md');
    assert.equal(body.completed, false);
  });

  test('rejects a missing title', async () => {
    const res = await app.request('/api/todos', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ title: '   ' }),
    });
    assert.equal(res.status, 400);
  });
});

describe('GET /api/todos/:id', () => {
  test('returns 404 for an unknown id', async () => {
    const res = await app.request('/api/todos/does-not-exist');
    assert.equal(res.status, 404);
  });
});

describe('PUT /api/todos/:id', () => {
  test('updates an existing todo', async () => {
    const created = await app.request('/api/todos', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ title: 'Time the manual baseline' }),
    });
    const { id } = await created.json();

    const res = await app.request(`/api/todos/${id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ completed: true }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.completed, true);
  });
});

describe('DELETE /api/todos/:id', () => {
  test('removes an existing todo', async () => {
    const created = await app.request('/api/todos', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ title: 'Delete me' }),
    });
    const { id } = await created.json();

    const res = await app.request(`/api/todos/${id}`, {
      method: 'DELETE',
      headers: { 'x-api-key': API_KEY },
    });
    assert.equal(res.status, 204);

    const after = await app.request(`/api/todos/${id}`);
    assert.equal(after.status, 404);
  });
});

// R9 — write endpoints require a valid x-api-key header.
describe('Auth on write endpoints', () => {
  test('rejects POST without an api key', async () => {
    const res = await app.request('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Should be blocked' }),
    });
    assert.equal(res.status, 401);
  });

  test('rejects PUT without an api key', async () => {
    const created = await app.request('/api/todos', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ title: 'To be updated' }),
    });
    const { id } = await created.json();

    const res = await app.request(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });
    assert.equal(res.status, 401);
  });

  test('rejects DELETE without an api key', async () => {
    const created = await app.request('/api/todos', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ title: 'To be deleted' }),
    });
    const { id } = await created.json();

    const res = await app.request(`/api/todos/${id}`, { method: 'DELETE' });
    assert.equal(res.status, 401);
  });

  test('rejects a wrong api key', async () => {
    const res = await app.request('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'not-the-real-key' },
      body: JSON.stringify({ title: 'Should be blocked' }),
    });
    assert.equal(res.status, 401);
  });
});

// R10 — todos persist across a restart (SQLite-backed, not just in-memory).
describe('Persistence', () => {
  const dbFile = join(tmpdir(), `release-captain-todos-test-${process.pid}.sqlite`);

  after(() => {
    if (existsSync(dbFile)) unlinkSync(dbFile);
  });

  test('todos survive closing and reopening the database file', () => {
    const first = new TodoDatabase(dbFile);
    const created = first.create('Survive a restart');
    first.close();

    const second = new TodoDatabase(dbFile);
    const found = second.getById(created.id);
    second.close();

    assert.ok(found, 'todo created before "restart" should still be there after reopening the db file');
    assert.equal(found?.title, 'Survive a restart');
  });
});
