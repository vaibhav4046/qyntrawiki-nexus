# QyntraWiki Nexus

A permission-first personal Wikipedia that turns your files, notes, links, cloud docs, and daily knowledge into a searchable, cited, HydraDB-powered wiki.

Built for the **HydraDB WikiThon**.

## One-Line Pitch

Connect files, notes, links, exports, and cloud knowledge. QyntraWiki Nexus compiles them into a cited, searchable, HydraDB-powered personal wiki.

## Live Demo

**Production URL:** https://qyntrawiki-qvh8yzqg0-vaibhav4046s-projects.vercel.app

## Core Flow

1. **Permission Center** — Connect sources with explicit consent (Local Folder, Google Drive, Notion, LinkedIn Export, Instagram Export, Manual URL, Manual Paste, Demo Dataset)
2. **Import Lab** — Ingest URLs, paste text, upload files, or load demo data
3. **AI Compiler** — Automatically extracts entities, claims, and generates Wikipedia-style pages
4. **HydraDB Memory Graph** — Visualize pages, sources, entities, claims, and relationships
5. **Ask My Wiki** — Natural language queries with citations and context transparency
6. **Organize Mode** — AI suggestions for categories, duplicates, stale files, missing context
7. **Contradictions Ledger** — Detect and review conflicting claims across sources
8. **Publish Mode** — Selectively publish pages publicly while keeping private sources hidden

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- shadcn/ui components
- Framer Motion
- React Flow (graph visualization)
- HydraDB SDK / REST API
- Gemini API (with mock fallback)
- In-memory data store (Vercel serverless-compatible)

## Environment Variables

```bash
HYDRA_DB_API_KEY=          # HydraDB API key
HYDRADB_TENANT_ID=         # HydraDB tenant ID
GEMINI_API_KEY=            # Google Gemini API key
DATABASE_URL=              # SQLite path (e.g. file:./dev.db)
NEXT_PUBLIC_APP_URL=       # App URL (e.g. http://localhost:3000)
```

If `HYDRA_DB_API_KEY` or `GEMINI_API_KEY` are missing, the app works in **Demo Mode** with deterministic mock data.

## Demo Mode

Click "Load Demo" on the landing page or visit `/app` directly. The demo includes:

- **7 sources** (HydraDB Overview, LLM Wiki Pattern, Vector Search Limitations, Counter-argument, PKOS Notes, Student Job Agent, Karpathy Notes)
- **8 wiki pages** (HydraDB, Context Graph, LLM Wiki, Vector Search Limitations, RAG vs Wiki, Contradiction Detection, Personal Knowledge OS, Student Job Agent)
- **Knowledge graph** with pages, sources, entities, claims
- **2 contradictions** (Vector Database sufficiency dispute)
- **Ask sessions** with cited answers
- **File browser** with 7 demo files
- **Publish settings** with public page selection

## Routes

### Public
- `/` — Landing page
- `/p/[wikiSlug]` — Public wiki home
- `/p/[wikiSlug]/[pageSlug]` — Public wiki article

### App (Authenticated/Personal)
- `/app` — Dashboard
- `/app/connect` — Permission Center
- `/app/import` — Import Lab
- `/app/wiki` — Wiki home
- `/app/wiki/[pageSlug]` — Article page
- `/app/files` — Personal File Browser
- `/app/graph` — Hydra Memory Graph
- `/app/ask` — Ask My Wiki
- `/app/organize` — AI Organization Assistant
- `/app/contradictions` — Contradiction Ledger
- `/app/publish` — Publish Mode

### Legacy (preserved)
- `/wiki/[slug]` — Old wiki dashboard
- `/wiki/[slug]/ingest` — Old ingest page
- `/wiki/[slug]/ask` — Old ask page
- `/wiki/[slug]/graph` — Old graph page
- etc.

## Running Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
```

## Scripts

- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check

## Security Notes

- All HydraDB and LLM calls run server-side
- API keys are never exposed to the client
- Connector tokens are stored server-side only
- For hackathon demos, session-only token mode is clearly labeled
- No arbitrary terminal command execution
- CLI Bridge Lite only implements safe exports (download bundles, copy commands, export Markdown/JSON)

## Architecture

```
src/
  app/
    page.tsx                    # Landing page
    app/                        # Main application routes
      layout.tsx                # App shell with navigation
      page.tsx                  # Dashboard
      connect/page.tsx          # Permission Center
      import/page.tsx           # Import Lab
      wiki/page.tsx             # Wiki home
      wiki/[pageSlug]/page.tsx  # Article renderer
      files/page.tsx            # File Browser
      graph/page.tsx            # React Flow graph
      ask/page.tsx              # Ask My Wiki chat
      organize/page.tsx         # AI Organization
      contradictions/page.tsx   # Contradiction Ledger
      publish/page.tsx          # Publish Mode
    p/[wikiSlug]/page.tsx       # Public wiki home
    p/[wikiSlug]/[pageSlug]/    # Public article
    api/                        # API routes
  lib/
    prisma.ts                   # In-memory data store
    ai.ts                       # Gemini AI integration
    hydradb.ts                  # HydraDB API client
    wiki-compiler.ts            # Compilation pipeline
    connectors/                 # Connector architecture
  components/ui/                # shadcn/ui components
```

## License

MIT — Built for HydraDB WikiThon.
