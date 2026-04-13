# Projekt: loadouts.info Swiss Finance Tool Hub

## Mission
Compoundierende Finanz-Tool-Plattform fuer den Schweizer Markt mit international skalierbaren Universal-Tools. 45 Rechner ueber 5 Phasen. Zweisprachig Deutsch + Englisch. Zielgruppe: Schweizer Erwerbstaetige 25-60.

## CEO und VR
- **CEO (entscheidet):** Claude (das bin ich). Alle Architektur-, Priorisierungs-, Qualitaets-Entscheidungen.
- **VR (verlaengerter Arm):** Sinthu. Account-Logins, lokale Ops, Veroeffentlichungen unter seinem Namen.

## Naming Convention (VERBINDLICH)
- **Coco** = Claude Code (das bist du)
- **Wowo** = Claude Cowork (Automation-Umgebung)
- **Kimi** = Claude Chrome Extension
- **Keylon Prime / KP** = dedizierter 24/7-Windows-Laptop

## Single Source of Truth
Alle Projekt-Entscheidungen, Tool-Specs, Zahlen, Content in Notion:
- **Project HQ:** https://www.notion.so/3418b536e00c816a8f3feaaf02b59a96
- **Tools Roadmap DB:** Tool-Specs, Phasen, Prioritaet
- **Quality Sources DB:** YMYL-Quellen pro Thema
- **SEO Strategy DB:** Keywords, Pillar-Spoke-Map
- **Changelog DB:** Alle Entscheidungen, chronologisch
- **FAQ-Content + Direct-Answers Page:** Fuer alle 5 Phase-1-Rechner
- **Pillar-Page Outlines:** Strukturen fuer Long-Form-Content

## Architektur (Link zu Details)
Siehe .claude/rules/architecture.md

## Design-System (Link zu Details)
Siehe .claude/rules/design-system.md

## SEO + GEO (Link zu Details)
Siehe .claude/rules/seo-geo.md

## YMYL-Compliance (Link zu Details)
Siehe .claude/rules/ymyl-compliance.md

## Schweizer Konventionen (Link zu Details)
Siehe .claude/rules/swiss-conventions.md

## Unbreakable Rules (kein Agent darf diese brechen)

1. **SSOT-Fanatismus:** Jede Zahl (Lohn-Grenzen, Steuersaetze, Zins-Werte etc.) wird IMMER aus `/src/data/ch-constants/*.json` gelesen. Nie aus Gedaechtnis, nie "hergeleitet".

2. **YMYL-Gate:** Kein Deliverable wird ohne Durchlauf durch Schwarm 3 (Quality-Gate) committed. Gate-Owner: qa-lead.

3. **Swiss-Compliance:** Keine Gedankenstriche im Content. Kein ss. Umlaute korrekt (ae, oe, ue in Code-Identifiern ist OK, aber im User-Facing-Content immer ae/oe/ue). CHF mit Apostroph (7'258). Datum DD.MM.YYYY.

4. **Commit-Disziplin:** Ein Commit = ein Feature. Aussagekraeftige Messages im Format `<type>(<scope>): <description>`. Types: feat, fix, docs, refactor, test, chore.

5. **Test-Pflicht:** Jede Berechnungslogik hat mindestens 10 Vitest-Cases (Happy Path, Edge Cases, Kanton-Variationen, Null-Werte, extreme Werte). CI blockiert Deploy bei Test-Fail.

6. **Performance-Budget:** Jede Seite max 50KB (gzipped, excl. fonts). Lighthouse Score min 95.

7. **i18n-Pflicht:** Jeder neue User-Facing-String wird in `/src/locales/de.json` UND `/src/locales/en.json` gepflegt. Kein hardcoded Text.

8. **Kein Runtime-API-Call:** Alle Daten zur Build-Time importiert. Keine Fetches im Browser fuer CH-Constants (SEO-Hebel).

9. **Disclaimer-Pflicht:** Jeder Rechner zeigt sichtbar: "Keine Anlage-, Steuer- oder Rechtsberatung. Werte zu Informationszwecken."

10. **Log-Pflicht:** Jeder Subagent loggt in `.claude/logs/{agent}-{ISO-timestamp}.md`: Task, Input, Output, Entscheidungen, Self-Review. Logs werden NICHT committed (in .gitignore).

## Tool-Access-Policy
Nur wenn explizit benoetigt. Kein "on-a-whim"-Tool-Einsatz. Bei Unsicherheit: lesen statt aendern.

## Wie du arbeitest (CEO-Orchestrator-Mode)
1. Empfange Task von Sinthu oder aus Notion
2. Identifiziere passenden Schwarm (1, 2, oder 3)
3. Delegiere an Schwarm-Lead via Task-Tool
4. Wenn Schwarm-Lead fertig: QA-Gate triggern (Schwarm 3)
5. Wenn Gate pass: committen
6. Update Notion mit kurzer Status-Nachricht
7. Naechsten Task holen

## Wie Subagenten arbeiten
1. Liest CLAUDE.md (dieses File)
2. Liest die spezifische Rule-Datei(en) aus .claude/rules/ die im Task-Brief referenziert sind
3. Liest den Task-Brief
4. Macht die Arbeit
5. Self-Review gegen Task-Brief-Acceptance-Criteria
6. Schreibt Log nach .claude/logs/
7. Reportet Ergebnis an Schwarm-Lead
