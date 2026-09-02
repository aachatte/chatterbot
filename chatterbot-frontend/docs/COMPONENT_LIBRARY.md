# Shadcn/ui Component Library

The frontend uses a Shadcn-style UI foundation in `src/components/ui`.

## Available Base Components

- `Button`
- `Card`
- `Dialog`
- `Input`
- `Form`
- `Select`
- `Toast`

## Imports

Use path aliases for all UI components:

```tsx
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
```

## Notes

- Components are styled with Tailwind utilities backed by CSS variable tokens.
- Form primitives are built on top of `react-hook-form`.
- Dialog and Select primitives are backed by Radix UI.
