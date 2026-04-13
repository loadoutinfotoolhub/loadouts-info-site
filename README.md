# loadouts.info

Swiss Finance Calculator Hub. 45 tools across 5 phases. Bilingual DE/EN. All 26 cantons.

## Status

**Phase 0: Foundation** - Complete (13.04.2026)

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Astro | 6.x |
| UI Islands | Svelte | 5.x |
| Styling | Tailwind CSS | 4.x |
| Validation | Zod | 4.x |
| Testing | Vitest | 4.x |
| Hosting | Cloudflare Pages | - |

## Getting Started

```bash
pnpm install
pnpm dev      # Start dev server at localhost:4321
pnpm build    # Build static site to dist/
pnpm test     # Run Vitest tests
pnpm preview  # Preview production build
```

## Architecture

- **SSOT JSON**: All Swiss finance constants in `src/data/ch-constants/2026.json`
- **Zod Schemas**: Type-safe validation in `src/schemas/`
- **i18n**: DE/EN locale files in `src/locales/`
- **Atomic Design**: UI components in `src/components/{ui,blocks,calculators,layout}/`
- **Multi-Agent**: Claude Code agent definitions in `.claude/`

## YMYL Compliance

All calculators follow 5-point verification:
1. Math verified against official sources (BSV, ESTV, SNB, FINMA)
2. Cross-verified with 3+ established tools (UBS, Comparis, Moneyland)
3. Edge cases tested (0-values, negatives, extremes)
4. Sources visible on every page
5. Disclaimer on every calculator

## Links

- **Domain**: https://loadouts.info
- **Project HQ**: Notion (private)
