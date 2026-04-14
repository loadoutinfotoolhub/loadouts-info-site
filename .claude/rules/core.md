# Core Rules

- UTF-8-Umlaute immer: ä, ö, ü. Nie ae/oe/ue. Ausnahme: URL-Slugs.
- SSOT: jeder Wert existiert einmal. src/styles/rarity.css ist SSOT für Farben.
- DRY: nichts doppelt. Sobald etwas zweimal identisch vorkommt, abstrahieren.
- Lighthouse 95+ Mobile. JS max 15KB pro Page.
- astro build muss exit 0 sein vor jedem git push.
- Kein Finance-Begriff darf je wieder in src/ auftauchen.
