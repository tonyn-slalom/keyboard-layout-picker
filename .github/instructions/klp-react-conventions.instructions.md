---
description: "Use when writing React, TypeScript, or Tailwind code for the keyboard layout picker. Covers component conventions, type patterns, Tailwind dark mode, and SVG keyboard rendering rules."
applyTo: "src/**/*.{ts,tsx}"
---
# KLP React/TypeScript Conventions

## Components
- Functional components only; no class components
- Named exports for all components except page-level (pages use default export)
- Props typed with `interface`, not `type`
- `React.memo` on list items (LayoutCard, RecommendationCard, Key)

## TypeScript
- Strict mode; no `any`
- Use `as const` for static lookup objects (fingerColors, columnarOffsets)
- Discriminated unions for state machines (test status: `'idle'|'running'|'error'|'complete'`)

## Tailwind
- Dark mode via `class` strategy (`dark:` variants required on all colored elements)
- No inline `style={}` except for SVG geometry (x, y, width, height)
- Finger colors: use `fill-*` classes, not hex values

## SVG Keyboards
- Always use `viewBox`, never fixed pixel width
- Home row keys get `ring-2 ring-white/40` to distinguish them
- Thumb keys rendered below bottom row

## Routing
- React Router v6 with `createBrowserRouter`
- `/results` is a guarded route — redirect to `/test/run` if no results in state
