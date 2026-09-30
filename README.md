# Log Percentiles

Drop a Vercel runtime-log export (JSON array, NDJSON or CSV) and get latency percentiles
(p50 / p75 / p90 / p95 / p99 / max, sample count, error rate) per endpoint, an endpoint detail
page and parse diagnostics. Everything runs in the browser in a Web Worker; nothing is uploaded.

## Run

```bash
bun install
bun run dev      # dev server
bun run test     # vitest
bun run build    # tsc -b + vite build
```

The upload screen has a "Try with sample data" link (`public/sample-logs.ndjson`).

## Supported formats

Format is sniffed from the first 4 KB: `[` = JSON array, `{` = NDJSON, anything else = CSV (header row required).
NDJSON is streamed line by line and CSV is streamed in 1 MB chunks (flat memory, byte-based progress). A JSON array is read whole with `file.text()` + `JSON.parse`, so practical size is about 100 MB. If the first NDJSON line is not valid JSON (e.g. a pretty-printed multi-line document) the whole file is tried as JSON before giving up.

### Extraction rules

Outer keys are lower-cased first. For each record:

1. **App sample** - `message` is a string starting with `{`, parses as JSON and has a finite `duration_ms`.
   Grouped as `app:METHOD normalizedUrl` (the source is part of the group key so app and Vercel samples of the same route never merge); `ns`, `status`, `level`, `time` come from the inner JSON.
   `isError = status >= 400 || level === "error"`.
2. **Vercel sample** - otherwise, a request-level duration (first finite of `duration`, `durationms`,
   `duration_ms`, `requestduration`, `elapsed`) plus a path (`requestpath` / `path`). Namespace is `vercel-request`.
3. **Skipped** - otherwise. Counted as "Non-JSON message" (e.g. stack traces) or "No duration field",
   with up to 20 examples kept. Malformed NDJSON lines are counted separately. Extraction never throws.

### URL normalisation

Origin and hash are dropped; path segments that are all digits, UUIDs or long hex become `:id`;
query keys are sorted, numeric values become `:id`, other values become `:<key>` (`slug=x` -> `slug=:slug`).
So `.../products/?product_id=93` groups as `/products/?product_id=:id`.

## Percentile method

Linear interpolation between closest ranks (Hyndman-Fan type 7, the NumPy default and Excel `PERCENTILE.INC`):
`h = (n-1)·p/100`, result = `x[floor h] + (h - floor h)·(x[ceil h] - x[floor h])`. Chosen because it is what
spreadsheets and most tooling report, so numbers can be cross-checked. Groups with fewer than 20 samples are
shown greyed/italic because their tail percentiles are unreliable. The spread chart omits them.

## Structure

```
src/
  domain/          pure TS, no React/DOM: types, stats, normalizeUrl, extractSample, histogram
  application/     parsePipeline (records -> ParseResult), filterAndGroup
  infrastructure/  detectFormat, readers, parse.worker, workerProtocol, workerClient
  features/        UI by feature; each folder = components + hooks + index.ts barrel
    upload/ parsing/ overview/ endpoint/ diagnostics/ layout/
  components/      shared presentational parts (panel, stat-card, method-badge) and shadcn primitives (ui/)
  lib/             format.ts, utils.ts (cn)
```

Dependencies point inward: features -> application -> domain; infrastructure depends on domain/application only.

### Conventions

- **Composition, shadcn-style.** Small parts composed by the caller (`StatsTable` + `StatsTableColumn` + `StatsTableRow`),
  each forwarding `className` and `...props` through `cn`. Context is used only where parts share state
  (sort state, chart scale, current group, histogram bins).
- **Logic in hooks.** `useLogFile`, `useFileDrop`, `useFilters`, `useSortedGroups`, `useChartScale`,
  `useEndpointDetail`, `useDiagnostics`, `useNavigation`. Components render; hooks compute (heavy work in `useMemo`).
- **Design tokens** live in `src/index.css`; components use token utilities (`bg-ink`, `text-lime`, `bg-p95`), never hex.
- URLs are never ellipsised: use the `url-wrap` utility.
- React 19 function components, `ref` as a prop. Navigation is plain state (`useNavigation`), no router.

Design mockups are in `docs/design/`.

## Not done / limits

The time-window filter offers relative presets (last 15 min / 1 h / 24 h of the file) but no custom range picker.
The endpoint page uses the same filtered samples as the overview (so n matches the clicked row).
CSV streaming relies on `FileReaderSync` inside the worker, so it is not covered by unit tests (bun lacks it).
