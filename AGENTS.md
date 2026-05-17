<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# QyntraWiki Nexus — Agent Notes

## Pac-Man Pixel-Art Theme
- **Colors**: Black (#000) background, Yellow (#ffeb3b) primary accent, Blue (#2121de) maze walls
- **Ghost palette**: Red (#ff0000), Pink (#ffb8ff), Cyan (#00ffff), Orange (#ffb852)
- **Fonts**: Press Start 2P (headings), VT323 (body, 20px), JetBrains Mono (code)
- **Borders**: 4px solid, zero border-radius, box-shadow offset for pixel depth
- **Utilities**: `pixel-card`, `pixel-btn`, `pixel-border`, `pixel-label`, `pixel-heading`, `gradient-pixel`
- **Scanlines**: `.scanlines::after` overlay for retro CRT effect

## Pretext Integration
- Installed: `@chenglou/pretext` for canvas text measurement
- Used in: `src/components/KnowledgeTree.tsx`
- API: `prepareWithSegments(text, font)` + `measureNaturalWidth(prepared)`
- Purpose: Precise label width measurement without DOM reflow

## Architecture
- Next.js 16 App Router, TypeScript, Tailwind v4
- In-memory Prisma store (`src/lib/prisma.ts`) for Vercel serverless
- 45+ routes: `/app/*` (dashboard, wiki, graph, ask, etc.) + `/p/*` (public wiki)
- Tauri desktop app at `C:\Users\lalwa\ok\` (needs Rust to compile)

## Build
- `npm run build` — zero build errors expected
- `npm run dev` — local dev on :3000
- Deploy URL: https://qyntrawiki-ba4jyivmx-vaibhav4046s-projects.vercel.app

## Always-On Skills
- 71 opencode skills in `~/.config/opencode/skills/`
- Config: `~/.config/opencode/opencode.json`
