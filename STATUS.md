# Account Intel — Project Status

> Last updated: July 6, 2026 (v4)

## TL;DR

7-layer pre-meeting brief engine powered by Sales Play guiding principles. Takes company/industry/domain/product/role/seniority/signals/pain-point/sales-play → generates structured sales brief in ~60s using Ollama via BYOK. Deployed on Vercel Hobby plan. Briefs/ICPs stored as JSON files on GitHub `main` branch. Report page redesigned with div-based layout and OD-confirmed CSS.

**Live:** `https://account-intel-kappa.vercel.app`  
**Repo:** `github.com/lupara1990/account-intel` (public, but GitHub account returns 404 to unauthenticated visitors — Vercel's `GITHUB_TOKEN` still works)  
**API:** `POST /api/brief-html` (7 layers in 3 waves) | `GET/POST /api/manage` (brief/ICP CRUD) | `GET /api/report?brief=` (server-rendered HTML)

---

## Architecture

```
index.html  ──→  api/brief-html.js  ──→  layer 1–7 handlers
                      │                      (gemma3:4b via Ollama API)
                      ├── api/_config.js      Shared config, parseJSON, competitor intel
                      ├── api/_github.js      GitHub file storage utility
                      ├── api/_news.js        SerpAPI Google News integration (1hr cache)
                      ├── api/_plays/         3 Sales Play definitions (injected into all 7 layers)
                      ├── api/manage.js       Consolidated CRUD for briefs + ICPs
                      └── api/report.js       Server-rendered HTML report
```

### 7 Layers

| # | Handler | Purpose | Tooling |
|--|---------|---------|---------|
| 1 | `layer1-signals.js` | Why this account, buying triggers | LLM + OpenCorporates + Wikidata + GNews (company filter) |
| 2 | `layer2-industry.js` | Industry trends, talk tracks (insight-selling) | LLM + GNews |
| 3 | `layer3-prospect.js` | Persona intel by role/seniority | LLM |
| 4 | `layer4-tech.js` | Tech stack from domain | BuiltWith API (primary) + `technology-detector` (fallback) |
| 5 | `layer5-compete.js` | Battle cards, positioning (Command of the Message + Challenger) | LLM + competitor knowledge base |
| 6 | `layer6-orchestrate.js` | Conversation path, value framing | LLM |
| 7 | `layer7-discovery.js` | Discovery guide, validation questions | LLM (8000 tokens) |

### Execution Order (3 waves)
1. Layers 1–4 (parallel)
2. Layers 5–6 (parallel, receives layer 2 context)
3. Layer 7 (sequential, receives all prior layers)

---

## Deployment

| Aspect | Detail |
|--------|--------|
| Platform | Vercel Hobby |
| Runtime | Node.js 24.x |
| Functions used | 8 of 12 limit (removed MCP server) |
| Timeout | 120s (`api/brief-html.js` only) |
| Env vars | `OLLAMA_API_KEY`, `SERPAPI_API_KEY`, `GITHUB_TOKEN`, `BUILTWITH_API_KEY` |

### Vercel Config (`vercel.json`)
- Rewrite: `/report` → `/api/report` (clean URL for saved briefs)
- Rewrite: `/v1/*` → `/index.html` (fallback route)
- `SERPAPI_API_KEY` set in vercel.json (replaced `GNEWS_API_KEY`)

---

## File Storage (GitHub)

Briefs → `briefs/<company>-<timestamp>.json` on `main` branch  
ICPs → `icps/<label>-<timestamp>.json` on `main` branch  

All mutations via `POST /api/manage` with `?type=brief` or `?type=icp`, authenticated by `GITHUB_TOKEN` env var (Vercel production/preview/development).

---

## Key Files

| Path | Role |
|------|------|
| `index.html` | Homepage + `renderReport()` with div-based layer body, OD-confirmed CSS, radius tokens, print styles, responsive grid |
| `guide.html` | Standalone "How to Use" + glossary with numbered badges |
| `api/brief-html.js` | Orchestrator — 3 waves, commits brief JSON to GitHub |
| `api/_config.js` | `parseJSON()`, `callLLM()`, `INCUMBENTS`, `INCUMBENTS_SIGNALS`, `COMPETITOR_INTEL` |
| `api/_github.js` | `commitFile()`, `listFiles()`, `deleteFile()` via GitHub Contents API |
| `api/_news.js` | GNews fetch with per-industry 1hr cache |
| `api/manage.js` | Consolidated brief/ICP CRUD endpoint |
| `api/report.js` | Server-rendered report at `/report?brief=` — div-based layout, OD-confirmed CSS |
| `api/layer*.js` | 7 individual layer handlers |
| `PRD.md` | Full product requirements (v2.0) |
| `DESIGN.md` | Design system tokens (MiniMax-based) |
| `GUIDE.md` | Markdown mirror of guide.html |
| `vercel.json` | Rewrites, function config, env |

---

## Recent Changes (v2.0)

- Consolidated 6 brief/ICP endpoints → single `api/manage.js` (stay under 12-function limit)
- `/report?brief=` endpoint serves server-rendered HTML from GitHub-stored JSON
- Renamed `thesis` → `summary` across all prompts, labels, keys, docs
- Enhanced battle cards (Layer 5): incumbent weakness, proof points, objection handling
- Competitor knowledge base in `_config.js`: Google, Microsoft, Salesforce, AWS, Apple profiles
- Sales methodology: Command of the Message + Challenger Sale (Layer 5), insight-selling (Layer 2)
- GNews integration with 1hr cache per industry
- Git tag `v2` created

## Recent Changes (v3)

- **Layer 1 upgraded**: OpenCorporates (company registry, incorporation date, jurisdiction, officers) + Wikidata (founded year, employee count, industry, parent org) + GNews company-specific news. Removed Crunchbase (no free tier). All free, no API keys required.
- **Layer 4 upgraded**: BuiltWith API as primary source (categorized: email, cloud, devices, analytics, marketing, security, CRM) with `technology-detector` as fallback.
- **LLM error handling**: `_config.js` `llm()` now uses `res.text()` + `JSON.parse()` instead of `res.json()` to surface descriptive error messages from Ollama API.
- **fetch timeout**: `fetchWithTimeout(5s)` in layer1-signals.js prevents hanging on external APIs.
- **Env vars added**: `BUILTWITH_API_KEY` (prod/preview/dev), `OLLAMA_API_KEY` added to Preview (was prod-only).
- **MCP server removed**: `packages/account-intel-mcp/` deleted — 8 functions used (was 9).
- **Debug endpoint removed**: `api/echobody.js` deleted.
- **Git tag `v3`** updated to latest commit.
- **Pain point + Product dropdowns**: Pain points limited to Manageability, Cost, Security. Products limited to Browser, ShadowAI, Cameyo, ChromeOS. No free-text.
- **SerpAPI replaces GNews**: `_news.js` uses `serpapi.com/search?engine=google_news`. More reliable real dates and results. Cache maintained.
- **Sales Play framework**: 3 play files in `api/_plays/` — Secure Enterprise Browsing, Modernization Dividend, AI-Native Defense. UI dropdown auto-populates product + pain point. Sales Play context (strategic rationale, theme, solutions, pain points, CEP resolution) injected into all 7 layer LLM prompts. Report badge shows active play.
- **Sales Play prompt injection**: `brief-html.js` loads play file, formats context block, passes to each layer. Every layer's `buildPrompt()` appends Sales Play context before JSON output instruction.
- **v4 — Report page redesigned**: Table-based `renderBody()` replaced with div-based layout using `.label`/`.value`/`.sec-hdr`/`.item-list`/`.pill`/`.bc-hdr`/`.tech-grid`/`.obj-item`/`.paths`/`.callout-accent`/`.callout-success` classes. CSS confirmed via OD `gemini-2.5-flash` generation. Radius tokens (`--radius-sm/md/lg/full`), print styles, responsive `.tech-grid` added. Both `index.html` and `api/report.js` updated in sync.

---

## Design System

- **Font:** DM Sans (Google Fonts)
- **Accent:** `#1456f0`
- **Ink:** `#0a0a0a`
- **Hairline:** `#e5e7eb`
- **Page wash:** `#f6f7f9`
- **Grid:** 4px spacing
- **Cards:** `border-radius: 12px`, no shadow
- Report CSS is a JS string inside `renderReport()` — independent of homepage CSS

---

## Known Issues

1. **GitHub account not publicly accessible** — `github.com/lupara1990` and all repos return 404 to unauthenticated visitors. The account is active and tokens work. Cause unclear (possibly flagged or profile privacy). Vercel's `GITHUB_TOKEN` still works. Contact GitHub Support with user ID `197529910`.
2. **Collaborator invite fails** — `ayushmanMKTS90` cannot be added (422 error). Needs email verified on GitHub.
3. **Local git remote stale** — local `origin` still points to `sales-kit-gen` (old name). The GitHub repo was renamed to `account-intel`.
4. **LLM latency** — ~60s for full generation (serverless cold start + 7 sequential LLM calls)
5. **`technology-detector`** — 51+ sub-dependencies, slow cold starts (BuiltWith serves as primary source now; fallback only)
6. **BuiltWith API key required** — without `BUILTWITH_API_KEY`, Layer 4 falls back to `technology-detector`
7. **Vercel auto-deploy broken** — git pushes no longer trigger Vercel deployments; must run `vercel deploy --prod` manually.

---

## Critical Rules for AI Agents

- Escape `</script>` in `win.document.write()` as `<' + '/script>`
- `esc()` must use `String(s || '')`
- Product field must NOT have a default value
- Industry value for Government: `"Government / Public Sector"`
- Event listeners in `DOMContentLoaded`, never inline `onchange`
- Report CSS/HTML = JS string in `renderReport()` — not affected by homepage CSS
- Layer 1 fetches from OpenCorporates, Wikidata, and GNews (company filter) with 5s timeout
- Layer 4 uses BuiltWith API (primary) with `technology-detector` (fallback)
- Sales Play files must live in `api/_plays/` (underscore prefix) so Vercel does not treat them as serverless functions (12-function Hobby limit)
- Sales Play context is formatted as a string block and passed to each layer's `buildPrompt()` via `salesPlayContext` parameter
- Layer 7 gets `maxTokens: 8000`; all others `3000`
- Return JSON from API, never HTML
- All body text `color: var(--text)` (black), accent `#1456f0` for interactive elements only

---

## Non-Goals

- Authentication/multi-tenancy
- PDF/Markdown export
- Dark mode
- CRM integration
- Custom industry templates
