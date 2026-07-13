# scoped-css-react-series

Monorepo of the scoped-css ecosystem — framework-agnostic CSS scoping with
adapters for React and server-reactor.

## Layout

- `scoped-css-core/` — framework-agnostic core (scopeCss, CssAdapter interface, createCssHooks factory)
- `scoped-css-react/` — React adapter (@gmono/scoped-css-react)
- `scoped-css-reactor/` — server-reactor adapter (@gmono/scoped-css-reactor)
- `scoped-css-react-playground/` — Vite + React playground for manual verification

## Usage

```bash
pnpm install
pnpm -r build
pnpm -r test
```
