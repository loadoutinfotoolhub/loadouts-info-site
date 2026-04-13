# Architektur-Regeln loadouts.info

## Ordner-Struktur
```
src/
├── components/
│   ├── ui/           # Atomic: Button, Input, Card, Toggle, NumberInput
│   ├── blocks/       # Molecular: FAQBlock, SourceList, ChainLinks, DisclaimerBlock
│   ├── calculators/  # Organism: je ein .svelte pro Rechner
│   └── layout/       # BaseLayout.astro, Header.astro, Footer.astro
├── data/
│   ├── ch-constants/
│   │   ├── 2026.json
│   │   └── 2027.json (future)
│   └── cantons/
│       ├── ZH/
│       ├── BE/
│       └── ... (26 Kantone total)
├── lib/
│   ├── calculators/  # Pure TS-Logik je Rechner
│   ├── ch-constants.ts
│   └── i18n.ts
├── locales/
│   ├── de.json
│   └── en.json
├── pages/
│   ├── de/
│   │   ├── index.astro
│   │   ├── saeule-3a-rechner.astro
│   │   └── ...
│   └── en/
├── schemas/          # Zod-Schemas
└── styles/
    └── global.css
```

## URL-Convention
- Flache URLs: `/de/saeule-3a-rechner`, nicht `/de/vorsorge/saeule-3a/rechner`
- snake_case URL-Params mit `in_` Prefix: `?in_bruttolohn=85000&in_kanton=zh`
- Locale-Switch: `/de/saeule-3a-rechner` <-> `/en/pillar-3a-calculator`

## Datei-Naming
- Kebab-case fuer Files: `saeule-3a-rechner.ts`
- PascalCase fuer Komponenten: `Saeule3a.svelte`
- camelCase fuer TS-Exports: `calcSaeule3a()`

## Build-Time vs Runtime
- **Build-Time (Astro SSG):** Alle Content-Pages, Rechner-Page-Layouts, SSOT-JSON-Imports
- **Runtime (Svelte Islands):** Nur Rechner-Interaktivitaet (Inputs -> Outputs)
- **Verbot:** Runtime-API-Calls fuer CH-Constants

## Performance-Budget
- Jede Page: max 50KB gzipped (HTML + CSS + JS, ohne Fonts)
- Lighthouse: min 95 in allen 4 Kategorien
- Core Web Vitals: alle gruen

## Testing
- Vitest fuer Unit-Tests der Berechnungslogik
- Mind. 10 Cases pro Rechner
- CI blockiert Deploy bei Fail
