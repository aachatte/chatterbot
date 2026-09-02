# Theming Design System

## Theme Provider

- App theme state is managed by `src/context/ThemeProvider.tsx`.
- `main.jsx` wraps the app in `ThemeProvider`.
- Theme mode is toggled from the layout via `useThemeToggle()`.

## Color System

The design system maps CSS variables to Tailwind tokens:

- Ole Miss Navy: `#00205b`
- Cardinal Red: `#c8102e`
- Semantic aliases: `brand.*`, `surface.*`

## CSS Files

- `src/styles/globals.css` contains Tailwind directives.
- `src/index.css` contains token definitions for light and dark modes.

## Dark Mode

Dark mode is activated using `[data-theme='dark']` and uses token overrides for surfaces, text, borders, and shadows.
