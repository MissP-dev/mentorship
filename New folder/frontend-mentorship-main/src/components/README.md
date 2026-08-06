# Components

This folder contains reusable UI components shared across pages.

## Conventions

- One component per file, named after the file (e.g., `Button.tsx` exports `Button`).
- Components here should be **stateless or minimally stateful** — pages handle orchestration.
- Accept props via a named interface exported from the same file (e.g., `ButtonProps`).
- Co-locate component-specific styles and tests alongside the component file.
- Do **not** put page-level components here — use `src/pages/` for those.
