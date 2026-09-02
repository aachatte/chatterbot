# TypeScript Migration Guide

## Goals

- Adopt TypeScript incrementally with strict mode enabled.
- Keep existing JavaScript pages working while new shared modules move to TypeScript.

## Configuration

- `tsconfig.app.json` is the app-level TypeScript configuration.
- `tsconfig.json` extends the app config and is used by `npm run typecheck`.
- Path aliases use `@/* -> src/*`.

## Incremental Migration Workflow

1. Convert shared utilities and UI primitives first (`src/lib`, `src/components/ui`).
2. Add concrete prop and return types for exported APIs.
3. Replace `any` with narrow unions/interfaces.
4. Keep `allowJs: true` until all JSX modules are migrated.

## Validation

Run the existing frontend checks:

```bash
npm run typecheck
npm run lint
npm run test:run
npm run build
```
