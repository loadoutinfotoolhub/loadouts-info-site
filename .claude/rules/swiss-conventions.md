# Schweizer Konventionen

## Waehrung
- Immer `CHF`, nie `SFr.`, nie `Franken` in Code
- Tausender-Trennzeichen: Apostroph (`7'258`, `85'000`)
- Kommastellen: Punkt (`5.30`)
- `new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(7258)` -> `CHF 7'258.00`

## Datum
- Format: DD.MM.YYYY (`13.04.2026`)
- `new Intl.DateTimeFormat('de-CH').format(new Date())` -> `13.04.2026`

## Sprache
- **Kein ss.** Immer `ss`.
- Umlaute korrekt: ae, oe, ue (im User-Facing-Content)
- **Keine Gedankenstriche (-- oder -):** Immer als Komma, Doppelpunkt, oder Punkt ersetzen.
- **Tonalitaet:** Du (nicht Sie) in Consumer-Content. Sachlich, hilfsbereit.

## Zahlen-Grenzwerte
- Mindesteingaben: 0 (nie negative)
- Maximaleingaben: sinnvolle Obergrenze (z.B. Bruttolohn max 10'000'000, sonst Validierungs-Warnung)
