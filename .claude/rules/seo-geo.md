# SEO + GEO Regeln loadouts.info

## Direct Answer
Erste 40-60 Woerter der Haupt-Prose muessen die Haupt-Keyword-Frage DIREKT beantworten. Format: Definition + konkrete Zahl + Kontext.

## Schema.org
Pro Rechner-Page:
- `WebApplication` (applicationCategory: FinanceApplication, offers price 0)
- `FAQPage` (mit den FAQ aus Notion)
- `BreadcrumbList`

Pro Pillar-Page:
- `Article`
- `FAQPage`
- `BreadcrumbList`

## llms.txt
```
# loadouts.info
> Schweizer Finanz-Rechner-Hub. 45 Tools fuer Lohn, Steuern, Vorsorge, Hypothek, Investments. Alle Kantone, DE/EN, mit Quellen und YMYL-konform.

## Vorsorge
- [Saeule 3a Rechner](https://loadouts.info/de/saeule-3a-rechner)
- [Pensionskasse Rechner](https://loadouts.info/de/pensionskasse-rechner)

## Lohn und Steuern
- [Lohnrechner Netto/Brutto](https://loadouts.info/de/lohnrechner)
- [Quellensteuer-Rechner](https://loadouts.info/de/quellensteuer-rechner)

## Hypothek
- [Tragbarkeitsrechner](https://loadouts.info/de/hypothek-tragbarkeit)
- [SARON-Hypothek](https://loadouts.info/de/saron-hypothek-rechner)
```

## robots.txt
```
User-agent: *
Allow: /
Sitemap: https://loadouts.info/sitemap.xml

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: CCBot
Allow: /
```

## Meta-Tag-Standard
```html
<title>{Primary Keyword} {Year} | loadouts.info</title>
<meta name="description" content="{120-155 Zeichen mit CTA und Zahlen}">
<link rel="canonical" href="{full-url}">
<link rel="alternate" hreflang="de" href="{de-url}">
<link rel="alternate" hreflang="en" href="{en-url}">
<link rel="alternate" hreflang="x-default" href="{de-url}">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
```
