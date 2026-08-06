# API

This folder contains API client code — functions that make HTTP requests to external services or backends.

## Conventions

- Group related endpoints into files (e.g., `users.ts`, `auth.ts`).
- Export async functions that return typed responses.
- Use types from `src/models/` for request/response shapes.
- Do **not** store API keys or secrets — use environment variables via `import.meta.env`.
- Handle errors centrally; throw or return typed error objects.
