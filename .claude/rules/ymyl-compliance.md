# YMYL-Compliance loadouts.info

## 5-fach-Verifikation (pro Rechner bei Launch)
1. Mathematische Logik gegen offizielle Formel verifiziert (BSV, ESTV, SNB, FINMA)
2. Mit min. 3 etablierten Tools querverifiziert (UBS, Comparis, Moneyland)
3. Edge Cases getestet (0-Werte, Negative, Extreme, Grenzfaelle)
4. Quellen sichtbar pro Page (E-E-A-T)
5. Disclaimer auf jeder Page

## Disclaimer-Text (immer gleicher Wortlaut)
DE: "Die Berechnungen auf loadouts.info sind unverbindliche Schaetzungen und stellen keine Anlage-, Steuer- oder Rechtsberatung dar."

EN: "Calculations on loadouts.info are non-binding estimates and do not constitute financial, tax, or legal advice."

## Verifizierte Kernwerte 2026 (Referenz fuer SSOT-JSON)

Siehe `src/data/ch-constants/2026.json` fuer aktuelle Werte. Falls JSON nicht erreichbar:

- Saeule 3a max mit PK: CHF 7'258
- Saeule 3a max ohne PK: CHF 36'288 oder 20% Nettoeinkommen
- AHV Arbeitnehmer: 5.3%
- IV Arbeitnehmer: 0.7%
- EO Arbeitnehmer: 0.25%
- ALV Arbeitnehmer: 1.1% (bis CHF 148'200)
- BVG Eintrittsschwelle: CHF 22'680
- BVG Koordinationsabzug: CHF 26'460
- BVG Max vers. Lohn: CHF 90'720
- BVG Umwandlungssatz: 6.8%
- AHV Max Einzelrente: CHF 2'450/Monat
- AHV Min Einzelrente: CHF 1'225/Monat
- Hypothek Kalk-Zins: 5%
- Hypothek Max Tragbarkeit: 33%
- Hypothek Min Eigenkapital: 20% (davon 10% hart)
- MwSt Normal: 8.1%
- MwSt Reduziert: 2.6%
- MwSt Beherbergung: 3.8%

## Quellen-Hierarchie
1. **A-Quellen (primaer):** .admin.ch (BSV, ESTV, SNB, FINMA), Fedlex.admin.ch
2. **B-Quellen (sekundaer):** Grossbanken UBS/ZKB/Raiffeisen/PostFinance, Vorsorge-Stiftungen finpension/VIAC/frankly
3. **Vermeiden:** Blogs, Foren, unverifizierte Ratgeber

## Bei Zahlen-Aenderung
1. Neue Quelle dokumentieren in Notion Quality-Sources-DB
2. SSOT-JSON updaten (neuer Versions-Eintrag)
3. Tests laufen lassen
4. Changelog-Eintrag in Notion
5. Git-Commit mit Source-Citation in Message
