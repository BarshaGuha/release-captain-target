# Requirements — v1.1.0 release

Target project: `express-todo-api-modern` (Hono/TypeScript todo API).
This is the checkable requirements list the Spec subagent verifies against
the code and the test suite. Each item should be traceable to one or more
tests in `src/routes/todos.test.ts`.

- [ ] **R1 — List todos.** `GET /api/todos` returns all todos as a JSON array.
- [ ] **R2 — Filter by completion status (new in this release).** `GET /api/todos?completed=true|false` returns only todos matching that status.
- [ ] **R3 — Get one todo.** `GET /api/todos/:id` returns the todo, or a 404 with an error body if the id doesn't exist.
- [ ] **R4 — Create a todo.** `POST /api/todos` creates a todo from `{ title }`, returns 201 with the created todo, and defaults `completed` to `false`.
- [ ] **R5 — Reject invalid input.** `POST /api/todos` returns 400 when `title` is missing or blank.
- [ ] **R6 — Update a todo.** `PUT /api/todos/:id` updates `title` and/or `completed`, returns the updated todo, or 404 if the id doesn't exist.
- [ ] **R7 — Delete a todo.** `DELETE /api/todos/:id` removes the todo and returns 204, or 404 if the id doesn't exist.
- [ ] **R8 — Test suite is real and green.** `npm test` runs an actual test suite (not a placeholder) and every test passes before release.

**Out of scope for v1.1.0:** persistence beyond in-memory storage, auth, pagination. Not requirements for this release — don't flag their absence as a gap.
