# Pages

This folder contains page-level components. Each file represents a full route/view in the application.

## Conventions

- One component per file, named after the file (e.g., `Home.tsx` exports `Home`).
- Page components are mounted by the router in `src/main.tsx`.
- Keep page components thin — compose them from smaller components in `src/components/`.
- Co-locate page-specific styles alongside the page file if needed.

## Current Routes

| Route     | Component                |
| --------- | ------------------------ |
| `/`       | `Home.tsx`               |
| `/home`   | `App.tsx` (welcome page) |
