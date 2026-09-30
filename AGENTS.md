# Agent guide

Client-only React 19 + TypeScript + Tailwind v4 app (Bun, Vite, Vitest). See README.md for behaviour.

## Commands
`bun install` · `bun run dev` · `bun run test` · `bun run build` (must pass with zero errors). No node binary: always use `bun`/`bunx --bun`.
Add shadcn parts with `bunx --bun shadcn@latest add <component>`.

## Layers (dependencies point inward)
- `src/domain` pure TS (no React/DOM): types, stats (type-7 percentile), normalizeUrl, extractSample, histogram.
- `src/application` pure orchestration: parsePipeline, filterAndGroup.
- `src/infrastructure` IO: detectFormat, readers, parse.worker, workerClient (+ workerProtocol).
- `src/features/<name>` UI = components + hooks + `index.ts` barrel. `src/components` = shared parts + shadcn `ui/`.

## Rules
1. Composition over config props: small exported parts composed by the caller, like shadcn Card. Forward `className` and `...props` via `cn`. No boolean/variant prop soup; use `aria-*`/`data-*` attributes for state styling. Context only for genuinely shared state.
2. Logic out of UI: every stateful/derived behaviour is a hook; components only render.
3. React 19: function components, `ref` is a prop, no forwardRef.
4. Colors come from tokens in `src/index.css`; never hardcode hex in components.
5. URLs wrap (`url-wrap`), never clip. Numbers/labels stay on one line, numbers in `font-mono`.
6. Accessibility: real buttons/links/labels, `aria-sort` on sortable headers, progressbar role, visible focus.
7. Extraction never throws; add a colocated `*.test.ts` for any domain/application/infrastructure change.
8. Percentiles use linear interpolation (type 7 / PERCENTILE.INC); do not change without updating tests and README.
