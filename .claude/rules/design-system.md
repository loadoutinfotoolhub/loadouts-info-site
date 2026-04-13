# Design-System loadouts.info

## Farben (60-30-10)
- **60% Off-white:** `#FAFAF9` (Background)
- **30% Swiss Finance Blue:** `#1E3A8A` (Primary Accent, Trust)
- **10% Confidence Green:** `#059669` (CTA, Success, Result)
- **Warning Swiss Red:** `#DC2626` (Errors, Over-Limit-Warnings)
- **Neutral Gray:** `#4B5563` (Body Text)

## Tailwind Config (in tailwind.config.js)
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: '#FAFAF9',
        primary: '#1E3A8A',
        success: '#059669',
        warn: '#DC2626',
        text: '#4B5563',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

## Typografie
- **Font:** Inter (self-hosted via `@fontsource/inter`)
- **Mobile Body:** 16px, line-height 1.6
- **Desktop Body:** 18px, line-height 1.6
- **Max Zeilen-Laenge:** 65 Zeichen
- **H1:** 32-48px, Bold
- **H2:** 24-32px, Semibold
- **H3:** 20-24px, Semibold
- **Reading Level:** 5.-7. Klasse (Hemingway-Grade 7)

## Layouts
- **Rechner-Page:** F-Layout, Inputs links 40% / Output rechts 60% (Desktop), stacked (Mobile)
- **Start-Page:** Z-Layout, Hero -> Tool-Grid -> CTA
- **Header:** max 5 Items

## CTAs
- **Wert-Framing:** "Jetzt Steuern sparen" statt "Jetzt berechnen"
- Keine "Submit"-Buttons bei Rechnern (Live-Update)

## Fachbegriff-Erklärungen (Rule 0b)

Jeder Fachbegriff auf User-Facing Pages muss für Laien erklärt sein.

### Komponenten
- **TermTooltip** (`src/components/ui/TermTooltip.svelte`): Inline-Element, das einen Fachbegriff mit Info-Icon und Tooltip/Popover erklärt. Props: `term` (string), `definition` (string), optional `id`.
- **GlossarySection** (`src/components/blocks/GlossarySection.svelte`): Block am Seitenende, der alle Fachbegriffe auflistet. Props: `entries` (Array von `{term, definition}`), `lang`.

### Verwendung
1. Im Intro-Text: `<TermTooltip client:load term="Säule 3a" definition="..." />` für die 2-3 wichtigsten Begriffe.
2. Am Seitenende: `<GlossarySection client:load entries={glossaryEntries} lang="de" />` mit allen Fachbegriffen.
3. Glossar-Einträge pro Seite als Array im Frontmatter definieren.

### Regeln
- Desktop: Hover öffnet Tooltip. Mobile: Tap öffnet Popover.
- A11y: `aria-describedby` für Screen-Reader.
- Bei > 3 Fachbegriffen auf einer Seite: Glossar-Sektion am Ende Pflicht.
- Massstab: Versteht ein 18-jähriger Lehrabgänger jedes Wort?
