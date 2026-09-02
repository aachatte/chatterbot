# Frontend modernization guide

## What was added

- TypeScript configuration with strict mode for new shared UI utilities
- Tailwind CSS design-token setup aligned to existing Ole Miss color variables
- Shared UI primitives in `src/components/ui`
- App-level providers for React Query, Sonner toasts, and theme switching
- React Hook Form + Zod auth forms
- Optional observability wiring for Sentry, PostHog, and web-vitals
- Vitest, Playwright, Storybook, ESLint, Prettier, and Husky configuration

## Recommended migration path for existing pages

1. Move repeated inline controls into `src/components/ui`
2. Add Zod schemas in `src/lib/validation.ts`
3. Fetch server state with React Query hooks in `src/hooks`
4. Prefer `@/` imports for shared modules
5. Use light/dark-safe CSS variables or Tailwind utility classes
6. Cover new flows with Vitest component tests before adding Playwright journeys

## Environment variables

Copy `.env.example` and set values as needed:

- `VITE_API_URL`
- `VITE_APP_VERSION`
- `VITE_SENTRY_DSN`
- `VITE_SENTRY_TRACES_SAMPLE_RATE`
- `VITE_POSTHOG_KEY`
- `VITE_POSTHOG_HOST`

## Common commands

```bash
npm run lint
npm run test:run
npm run build
npm run storybook
npm run e2e
npm run analyze
```
