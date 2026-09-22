import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Hono } from 'hono';
import todos from './todos.js';

// Hono apps can be exercised directly with app.request() — no server needed.
const app = new Hono().route('/api/todos', todos);

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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Time the manual baseline' }),
    });
    const { id } = await created.json();

    const res = await app.request(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Delete me' }),
    });
    const { id } = await created.json();

    const res = await app.request(`/api/todos/${id}`, { method: 'DELETE' });
    assert.equal(res.status, 204);

    const after = await app.request(`/api/todos/${id}`);
    assert.equal(after.status, 404);
  });
});
