# Account Intel — Product Requirements Document (PRD)

**Version:** 2.0  
**Last Updated:** July 2026  
**Repo:** `lupara1990/account-intel`  
**Live URL:** `https://account-intel-kappa.vercel.app`  
**API Endpoint:** `/api/brief-html` (POST)

---

## 1. Product Overview

**Account Intel** is a 7-layer pre-meeting intelligence engine that generates structured, actionable briefs for sales meetings. It synthesizes account signals, industry context, prospect intelligence, tech stack, competitive positioning, conversation strategy, and discovery guidance — tailored to a specific prospect and product.

**Core Value:** Transform 10+ minutes of manual research into a 60-second AI-generated brief that follows a proven 7-layer framework.

### Design System
- **Font:** DM Sans (Google Fonts)
- **Accent:** `#1456f0`
- **Ink:** `#0a0a0a`
- **Hairline:** `#e5e7eb`
- **Spacing Grid:** 4px
- **Page Wash:** `#f6f7f9`
- **Cards:** `border-radius: 12px`, no shadow
- Reference: `DESIGN.md`

---

## 2. User Journey

1. **Landing Page** → Select Industry (auto-populates 8 signals + pain point)
2. **Configure Brief** → Click "Configure Brief" header button → modal form opens
3. **Fill Form** → Company, Domain, Product, Prospect Role, Seniority, Signals, Pain Point
4. **Generate Brief** → Opens in new tab with animated 7-step loading screen
5. **Review Report** → Dashboard-style full-width report with sectioned cards
6. **Save & Reuse** → "Save as ICP Profile" (persists form state), "Saved Briefs" history
7. **Guide** → Separate `/guide.html` page with "How to Use" + "How to Read the Report"

---

## 3. 7-Layer Framework

| Layer | Key | Title | Purpose |
|-------|-----|-------|---------|
| 1 | `layer1_account_signals` | Why this account? | Buying triggers, urgency signals, validation questions |
| 2 | `layer2_industry_pulse` | Industry context | Trends, talking points, recent news, vertical shifts |
| 3 | `layer3_prospect_intel` | Who you're meeting | Priorities, concerns, influence level, success metrics |
| 4 | `layer4_tech_context` | Their tech setup | Email, cloud, devices, detected technologies, confidence |
| 5 | `layer5_competitive_context` | How to position us | Reframe headline, incumbent strengths, our lever, avoid phrases |
| 6 | `layer6_product_orchestration` | Your conversation path | Best/backup paths, entry trigger, value framing, call sequence |
| 7 | `layer7_discovery_support` | Discovery guide | Validation questions, buying signals, pivot paths, avoid phrases |

---

## 4. Technical Architecture

### Frontend (Single HTML File)
- **Framework:** Vanilla ES6, no build step
- **Styling:** Embedded CSS (DM Sans font, CSS Grid/Flexbox)
- **Icons:** Ionicons 7.1 (ESM module from unpkg)
- **State:** GitHub repo file storage (`briefs/` and `icps/` folders on `main` branch) for Saved Briefs + ICP Profiles
- **Modals:** CSS overlay with pointer-events toggling (no display:none)
- **Report:** Client-side `renderReport()` generates dashboard-style HTML from JSON response
- **Deployment:** Static on Vercel

### Backend (Vercel Serverless Functions)
- **Runtime:** Node.js 18.x
- **LLM:** Gemma 3 4B via Ollama API (`ollama.com/api/chat`)
- **Max Tokens:** 3000 default, 8000 for Layer 7
- **Parallelization:** Layers 1-4 → 5-6 → 7 (3 sequential waves)
- **Response:** JSON — client renders HTML via `renderReport()` in `index.html`
- **Tech Detection:** Layer 4 uses `technology-detector` npm package (not LLM) for domain scanning

### API Contract
```json
POST /api/brief-html
{
  "company": "string",
  "industry": "Finance|Healthcare|Technology|Retail|Manufacturing|Energy|Government / Public Sector|Education",
  "domain": "string",
  "product": "string",
  "role": "string",
  "seniority": "C-Level|VP/Director|Manager|IC",
  "signals": ["string"],
  "painPoint": "string"
}
```

**Response:** JSON with all 7 layer objects + `generated_at`, `company`, `industry`, `product`, `role`, `seniority`

*Note: `domain`, `signals`, and `painPoint` are consumed server-side only and not echoed back in the response. ICP profile state is managed via the GitHub-backed API (`/api/manage?type=icp`).*

---

## 5. Key Features

### Homepage
- **Industry Selector** → 8 options, `addEventListener('change')` (no inline `onchange`)
- **Auto-populate Signals** → 8 industry-specific signals per vertical
- **Auto-populate Pain Point** → Context-aware default per industry
- **Product Field** → Placeholder only, **no default value** (intentional)
- **Generate Button** → Opens popup tab synchronously (avoids popup blocker)
- **How to Use This Tool** → 9-step numbered guide card
- **How to Read the Report** → 7-layer glossary with numbered badges
- **Saved Briefs** → GitHub files (`briefs/` folder), click to reopen, delete button
- **ICP Profiles** → GitHub files (`icps/` folder), click to apply (pre-fills all except Product)

### Report Page (Popup Tab)
- **Loading Screen** → 7 animated steps (~60s total)
- **Topbar** → Home link, date, "Save as ICP Profile" button (bookmark icon)
- **4 KPI Stat Cards** → Signal Strength, Talking Points, Influence Level, Tech Detected (with progress bars)
- **Accordion Cards** → 7 layers in single column, collapsed by default, chevron toggle
- **Content** → Data tables, CSS bar charts, 2-column grids for lists
- **Icons** → Ionicons throughout (analytics, chatbubbles, person, hardware-chip, wallet, medkit, laptop, cart, settings, flash, business, school, document-text, bookmark, checkmark)

---

## 6. Data Persistence (GitHub File Storage)

Saved Briefs and ICP Profiles are stored as JSON files in the `briefs/` and `icps/` folders of the public GitHub repo (`lupara1990/account-intel`, `main` branch). All mutations go through the consolidated `/api/manage` endpoint which uses the GitHub Contents API (authenticated via `GITHUB_TOKEN` env var).

### `briefs/<company>-<ts>.json` (Saved Briefs)
```json
{
  "company": "string",
  "industry": "string",
  "domain": "string",
  "product": "string",
  "role": "string",
  "seniority": "string",
  "signals": ["string"],
  "painPoint": "string",
  "generated_at": "ISO timestamp",
  "layer1_signals_reasoning": "...",
  ...
}
```

### `icps/<label>-<ts>.json` (ICP Profiles)
```json
{
  "company": "string",
  "industry": "string",
  "domain": "string",
  "role": "string",
  "seniority": "string",
  "signals": ["string"],
  "painPoint": "string",
  "date": "ISO timestamp"
}
```

**Note:** Applying an ICP profile **does not** pre-fill Product field (intentional UX decision).

---

## 7. Bug Fixes & Guardrails

| Issue | Fix |
|-------|-----|
| `</script>` in string literals breaks HTML parser | Escape as `<' + '/script>` and `<' + 'script>` |
| `esc()` throws on arrays/objects | `String(s || '')` instead of `(s || '')` |
| Government industry value mismatch | Option value = `"Government / Public Sector"` (matches `INDUSTRY_SIGNALS` key) |
| Inline `onchange` blocked by CSP | Use `addEventListener('change', ...)` in `DOMContentLoaded` |
| Pain point not updating | Removed `if (!pp.value)` guard — always overwrite |
| Popup blocked | `window.open('', '_blank')` called **synchronously** before `await` |
| `resp.json()` fails on HTML response | API returns JSON; client calls `renderReport()` |
| Long report load time | Dashboard-style layout with sectioned cards |
| Dead code in `brief-html.js` | Removed unused `renderBriefHtml()` + `LAYERS` array (~440 lines) |
| Stray backtick chars in `brief-html.js` | Cleaned syntax, removed redundant `module.exports` |
| Stale API endpoints | Deleted unused `brief.js` and `layers.js` |
| Missing `package.json` dependencies | Added `technology-detector: ^1.0.4`, engine `node: 18.x` |
| `_fetched.html` artifact | Deleted stale fetched copy of homepage |

---

## 8. Industries & Signal Mapping

```javascript
INDUSTRY_SIGNALS = {
  Finance: [...8 signals...],
  Healthcare: [...8 signals...],
  Technology: [...8 signals...],
  Retail: [...8 signals...],
  Manufacturing: [...8 signals...],
  Energy: [...8 signals...],
  'Government / Public Sector': [...8 signals...],
  Education: [...8 signals...]
}
```

Pain point defaults per industry:
- Finance → "lead generation"
- Healthcare → "patient data security"
- Technology → "sales efficiency"
- Others → "digital transformation"

---

## 9. Deployment & Config

### Vercel Environment Variables
- `OLLAMA_API_KEY` — Production only (set in Vercel dashboard)

### GitHub
- Public repo: `github.com/lupara1990/account-intel`
- Deploy on push to main via Vercel Git integration

### Local Development
```bash
cd account-intel
npx vercel dev  # Runs on localhost:3000
```

---

## 10. Known Limitations

- **No authentication** — public repo file storage (anyone with the URL can read briefs)
- **LLM latency** — ~60s for full 7-layer generation
- **Tech detection** — Layer 4 uses `technology-detector` npm package; accuracy depends on domain reachability and DNS resolution from serverless runtime
- **No export** — Briefs viewable in-browser only
- **Single-user** — No multi-tenancy or team sharing
- **`technology-detector` package imports 51+ sub-dependencies** — cold start may be slower

---

## 11. Future Enhancements (Backlog)

- [ ] Export brief as PDF/Markdown
- [ ] Team workspaces with shared ICP profiles
- [ ] CRM integration (Salesforce, HubSpot)
- [ ] Custom industry signal templates
- [ ] Webhook for brief completion
- [ ] Dark mode toggle
- [ ] Keyboard shortcuts for report navigation
- [ ] Retry/fallback LLM model option
- [ ] Cached tech detection results per domain

---

## 12. File Structure

```
account-intel/
├── api/
│   ├── brief-html.js        # Main orchestrator (7 layers in 3 waves)
│   ├── layer1-signals.js    # Why this account, why now
│   ├── layer2-industry.js   # Industry trends & talk tracks
│   ├── layer3-prospect.js   # Persona intel (role-based)
│   ├── layer4-tech.js       # Tech stack detection (npm pkg)
│   ├── layer5-compete.js    # Competitive positioning
│   ├── layer6-orchestrate.js# Conversation path strategy
│   ├── layer7-discovery.js  # Discovery prompts & pivot paths
│   └── _config.js           # Shared LLM config, parseJSON repair
├── index.html               # Bento-grid homepage + renderReport()
├── guide.html               # Standalone Getting Started guide
├── GUIDE.md                 # Guide in Markdown (mirrors guide.html)
├── DESIGN.md                # Minimax design system tokens
├── package.json
├── package-lock.json
├── vercel.json
└── PRD.md                   # This document
```

---

## 13. Quick Reference for AI Agents

**When modifying `index.html`:**
- Escape ALL `<script>` and `</script>` in JS string literals as `<' + 'script>` / `<' + '/script>`
- `esc()` must use `String(s || '')`
- Product input: `<input id="product" placeholder="...">` (no `value`)
- Industry select: `<option value="Government / Public Sector">`
- Event listeners in `DOMContentLoaded`, not inline handlers
- Report uses dashboard-style layout (full-width sectioned cards, not accordion)
- Modal overlay uses `pointer-events` toggling (not `display:none`)
- Design tokens in `DESIGN.md` (DM Sans, `#1456f0` accent, 4px grid)
- Guide content is on separate `guide.html` page
- `</script>` in `win.document.write()` must be escaped as `<'+'/script>`

**When modifying API:**
- Return JSON, not HTML
- Layer 7 gets 8000 maxTokens; others 3000
- Parallelize independent layers (1-4, then 5-6, then 7)
- Layer 4 uses `technology-detector` npm package (dynamic import), not LLM
- Only `api/brief-html.js` is the active endpoint (`brief.js` and `layers.js` are deleted)

**When debugging:**
- Check Vercel function logs for LLM timeouts or `technology-detector` failures
- Verify `OLLAMA_API_KEY` in Vercel Production env
- Briefs/ICPs stored as JSON files in `briefs/` and `icps/` folders via GitHub API (`/api/manage`)
- Report CSS is a JS string inside `renderReport()` — not affected by homepage CSS
- All body text is `color: var(--text)` (black); accent `#1456f0` for interactive elements only