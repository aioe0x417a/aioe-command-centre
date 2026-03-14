# AIOE Command Centre

The browser-based dashboard for AIOE — Azzay's personal AI operations platform. This is the web counterpart to the AIOE mobile app.

## Core Rule

Always invoke the front-end design skill before writing any front-end code, every session, no exceptions.

## Stack

- **Framework:** Next.js (App Router) + TypeScript
- **UI:** shadcn/ui + Radix UI + Tailwind CSS v4
- **State:** Zustand (client) + TanStack Query (server)
- **Animation:** Framer Motion
- **Charts:** Tremor + Recharts
- **Auth:** API key gate (simple, for now)
- **Package manager:** pnpm only

## Design Language

- **Theme:** Dark-first, cyberpunk aesthetic
- **Background:** Dark/near-black (#0a0a0f or similar)
- **Primary accent:** Cyan (#00f0ff)
- **Secondary accent:** Purple (#a855f7)
- **Text:** White/light gray on dark backgrounds
- **Feel:** Futuristic command centre — clean, data-dense, glowing accents
- Look at `brand_assets/` for logo and brand guidelines (when available)

## Screenshot Workflow

Use Puppeteer for visual QA. After building or changing UI:

1. Start the dev server if not running
2. Take screenshots of each major section (viewport-sized captures)
3. Save to `temporary_screenshots/` folder
4. Compare against reference designs (if any) or review for visual quality
5. Do at least 2 passes of screenshot-review-and-fix
6. Clean up `temporary_screenshots/` when done with a build cycle

**Exception:** For animated/dynamic elements (backgrounds, shaders, particle effects), do NOT use the screenshot loop — it can't capture motion well and leads to infinite correction loops. Just write the code and let me review visually.

## Website Inspiration Workflow

When cloning or drawing inspiration from existing sites:
1. I'll provide a full-page screenshot + CSS styles from DevTools
2. Build a structural clone first, matching layout and proportions
3. Then apply AIOE branding (colors, logo, copy) in a second pass
4. Use screenshot loop to compare against reference

For individual components, I may provide code from 21st.dev or similar — integrate directly into the relevant section.

## Development Rules

- Always test on localhost first
- Do NOT push to GitHub until I explicitly say so
- All API calls go through Next.js API routes (never expose keys to client)
- `.env.local` must be in `.gitignore`
- Do not commit secrets

## Backend API

- AIOE backend: `https://api.aioe.space`
- Proxied via Cloudflare Tunnel from main laptop

## Deployment

- Deployed to Vercel via GitHub auto-deploy
- Remote: https://github.com/aioe0x417a/aioe-command-centre.git
- Push to `master` triggers auto-deploy
