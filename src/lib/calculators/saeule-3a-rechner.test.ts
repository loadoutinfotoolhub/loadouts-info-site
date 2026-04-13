import { describe, it, expect } from 'vitest';
import { calcSaeule3a } from './saeule-3a-rechner';

describe('Saeule 3a Rechner', () => {
  // 1. Happy Path: mit PK, typische Einzahlung
  it('berechnet korrekt mit PK und Maximaleinzahlung', () => {
    const r = calcSaeule3a({ hasPensionskasse: true, einzahlung: 7258, grenzSteuersatz: 0.25 });
    expect(r.maxErlaubt).toBe(7258);
    expect(r.effektiveEinzahlung).toBe(7258);
    expect(r.ueberEinzahlung).toBe(0);
    expect(r.steuerersparnis).toBe(1814.5);
  });

  // 2. Uebereinzahlung mit PK
  it('erkennt Uebereinzahlung mit PK', () => {
    const r = calcSaeule3a({ hasPensionskasse: true, einzahlung: 10000, grenzSteuersatz: 0.25 });
    expect(r.maxErlaubt).toBe(7258);
    expect(r.effektiveEinzahlung).toBe(7258);
    expect(r.ueberEinzahlung).toBe(2742);
    expect(r.steuerersparnis).toBe(1814.5);
  });

  // 3. Ohne PK: 20% des Einkommens
  it('berechnet ohne PK: 20% des Nettoeinkommens', () => {
    const r = calcSaeule3a({ hasPensionskasse: false, nettoeinkommen: 100000, einzahlung: 25000, grenzSteuersatz: 0.3 });
    expect(r.maxErlaubt).toBe(20000);
    expect(r.effektiveEinzahlung).toBe(20000);
    expect(r.ueberEinzahlung).toBe(5000);
    expect(r.steuerersparnis).toBe(6000);
  });

  // 4. Ohne PK: Max-Cap bei CHF 36'288
  it('deckelt ohne PK bei CHF 36288', () => {
    const r = calcSaeule3a({ hasPensionskasse: false, nettoeinkommen: 500000, einzahlung: 40000, grenzSteuersatz: 0.35 });
    expect(r.maxErlaubt).toBe(36288);
    expect(r.effektiveEinzahlung).toBe(36288);
    expect(r.ueberEinzahlung).toBe(3712);
  });

  // 5. Null-Einzahlung
  it('berechnet mit Einzahlung 0', () => {
    const r = calcSaeule3a({ hasPensionskasse: true, einzahlung: 0, grenzSteuersatz: 0.25 });
    expect(r.maxErlaubt).toBe(7258);
    expect(r.effektiveEinzahlung).toBe(0);
    expect(r.ueberEinzahlung).toBe(0);
    expect(r.steuerersparnis).toBe(0);
  });

  // 6. Steuersatz 0
  it('berechnet mit Steuersatz 0', () => {
    const r = calcSaeule3a({ hasPensionskasse: true, einzahlung: 7258, grenzSteuersatz: 0 });
    expect(r.steuerersparnis).toBe(0);
  });

  // 7. Maximaler Steuersatz 50%
  it('berechnet mit maximalem Steuersatz', () => {
    const r = calcSaeule3a({ hasPensionskasse: true, einzahlung: 7258, grenzSteuersatz: 0.5 });
    expect(r.steuerersparnis).toBe(3629);
  });

  // 8. Ohne PK, kein Nettoeinkommen (default 0)
  it('ohne PK und kein Nettoeinkommen ergibt maxErlaubt 0', () => {
    const r = calcSaeule3a({ hasPensionskasse: false, einzahlung: 5000, grenzSteuersatz: 0.2 });
    expect(r.maxErlaubt).toBe(0);
    expect(r.effektiveEinzahlung).toBe(0);
    expect(r.ueberEinzahlung).toBe(5000);
    expect(r.steuerersparnis).toBe(0);
  });

  // 9. Extreme Werte: Milliardaer
  it('funktioniert mit extremen Werten', () => {
    const r = calcSaeule3a({ hasPensionskasse: false, nettoeinkommen: 10000000, einzahlung: 36288, grenzSteuersatz: 0.45 });
    expect(r.maxErlaubt).toBe(36288);
    expect(r.effektiveEinzahlung).toBe(36288);
    expect(r.ueberEinzahlung).toBe(0);
    expect(r.steuerersparnis).toBeCloseTo(16329.6, 1);
  });

  // 10. Negative Werte via Zod rejected
  it('wirft bei negativer Einzahlung einen Zod-Fehler', () => {
    expect(() => calcSaeule3a({ hasPensionskasse: true, einzahlung: -1000, grenzSteuersatz: 0.2 })).toThrow();
  });

  // 11. Zu hoher Steuersatz rejected
  it('wirft bei Steuersatz > 0.5 einen Zod-Fehler', () => {
    expect(() => calcSaeule3a({ hasPensionskasse: true, einzahlung: 7258, grenzSteuersatz: 0.8 })).toThrow();
  });

  // 12. Kanton-Variation: ZG (tiefer Steuersatz)
  it('Kanton ZG: tiefe Steuerersparnis', () => {
    const r = calcSaeule3a({ hasPensionskasse: true, einzahlung: 7258, grenzSteuersatz: 0.10 });
    expect(r.steuerersparnis).toBeCloseTo(725.8, 1);
  });

  // 13. Kanton-Variation: GE (hoher Steuersatz)
  it('Kanton GE: hohe Steuerersparnis', () => {
    const r = calcSaeule3a({ hasPensionskasse: true, einzahlung: 7258, grenzSteuersatz: 0.40 });
    expect(r.steuerersparnis).toBeCloseTo(2903.2, 1);
  });

  // 14. Querverifikation: Teileinzahlung mit PK
  it('Teileinzahlung unter Maximum', () => {
    const r = calcSaeule3a({ hasPensionskasse: true, einzahlung: 3000, grenzSteuersatz: 0.25 });
    expect(r.maxErlaubt).toBe(7258);
    expect(r.effektiveEinzahlung).toBe(3000);
    expect(r.ueberEinzahlung).toBe(0);
    expect(r.steuerersparnis).toBe(750);
  });
});
