import { describe, it, expect } from 'vitest';
import { calcSaronHypothek } from './saron-hypothek';

const base = { hypothekBetrag: 800_000, laufzeitJahre: 10, bankMarge: 0.8, saronAnnahme: 0.3 };

describe('SARON-Hypothek Rechner', () => {
  // 1. Standard-Fall
  it('berechnet Standardfall korrekt', () => {
    const r = calcSaronHypothek(base);
    expect(r.totalRate).toBe(1.1);
    expect(r.jahreszins).toBe(8800);
    expect(r.monatsrate).toBe(Math.round(8800 / 12));
  });

  // 2. Gesamtkosten über Laufzeit
  it('Gesamtkosten = Jahreszins × Laufzeit', () => {
    const r = calcSaronHypothek(base);
    expect(r.gesamtKosten).toBe(r.jahreszins * 10);
  });

  // 3. Vergleich mit Festhypothek
  it('Festhypothek-Vergleich bei 2.0%', () => {
    const r = calcSaronHypothek(base);
    expect(r.vergleichFesthypothek10J).toBe(16000); // 800k × 2%
  });

  // 4. Ersparnis gegenüber Festhypothek
  it('Ersparnis ist positiv bei günstigem SARON', () => {
    const r = calcSaronHypothek(base);
    expect(r.ersparnisFesthypothek).toBeGreaterThan(0);
  });

  // 5. Szenarien: 7 Stück
  it('generiert 7 Szenarien', () => {
    const r = calcSaronHypothek(base);
    expect(r.szenarien.length).toBe(7);
  });

  // 6. Stress-Test bei SARON 3%
  it('Stress-Test bei 3% SARON', () => {
    const r = calcSaronHypothek(base);
    expect(r.stressTest.saron).toBe(3);
    expect(r.stressTest.totalRate).toBe(3.8);
    expect(r.stressTest.jahreszins).toBe(30400); // 800k × 3.8%
  });

  // 7. Null-Hypothek
  it('Null-Hypothek ergibt alles 0', () => {
    const r = calcSaronHypothek({ ...base, hypothekBetrag: 0 });
    expect(r.jahreszins).toBe(0);
    expect(r.monatsrate).toBe(0);
  });

  // 8. Hohe Marge
  it('hohe Marge erhöht Gesamtrate', () => {
    const r = calcSaronHypothek({ ...base, bankMarge: 2.0 });
    expect(r.totalRate).toBe(2.3);
  });

  // 9. Negativer SARON
  it('negativer SARON reduziert Kosten, Minimum 0', () => {
    const r = calcSaronHypothek({ ...base, saronAnnahme: -1, bankMarge: 0.8 });
    expect(r.totalRate).toBe(0); // -1% + 0.8% = -0.2%, Floor 0%
    expect(r.jahreszins).toBe(0);
  });

  // 10. Kurze Laufzeit
  it('1 Jahr Laufzeit korrekt', () => {
    const r = calcSaronHypothek({ ...base, laufzeitJahre: 1 });
    expect(r.gesamtKosten).toBe(r.jahreszins);
  });

  // 11. Lange Laufzeit
  it('30 Jahre Laufzeit korrekt', () => {
    const r = calcSaronHypothek({ ...base, laufzeitJahre: 30 });
    expect(r.gesamtKosten).toBe(r.jahreszins * 30);
  });

  // 12. Extreme Hypothek
  it('CHF 5M Hypothek funktioniert', () => {
    const r = calcSaronHypothek({ ...base, hypothekBetrag: 5_000_000 });
    expect(r.jahreszins).toBe(55000); // 5M × 1.1%
  });

  // 13. Zod: negative Hypothek
  it('wirft bei negativer Hypothek', () => {
    expect(() => calcSaronHypothek({ ...base, hypothekBetrag: -1 })).toThrow();
  });

  // 14. Zod: Laufzeit 0
  it('wirft bei Laufzeit 0', () => {
    expect(() => calcSaronHypothek({ ...base, laufzeitJahre: 0 })).toThrow();
  });

  // 15. Szenarien sind aufsteigend sortiert nach SARON
  it('Szenarien aufsteigend sortiert', () => {
    const r = calcSaronHypothek(base);
    for (let i = 1; i < r.szenarien.length; i++) {
      expect(r.szenarien[i].saron).toBeGreaterThanOrEqual(r.szenarien[i - 1].saron);
    }
  });
});
