import { describe, it, expect } from 'vitest';
import { calcTragbarkeit } from './tragbarkeit';

const base = { immobilienwert: 1_000_000, bruttoeinkommen: 200_000, eigenkapital: 200_000 };

describe('Hypothek-Tragbarkeit Rechner', () => {
  // 1. Standard-Fall: 1M Immobilie, 200k EK, 200k Einkommen
  it('berechnet Standardfall korrekt', () => {
    const r = calcTragbarkeit(base);
    expect(r.hypothek).toBe(800_000);
    expect(r.belehnung).toBe(80);
    expect(r.eigenkapitalQuote).toBe(20);
    expect(r.fehlendesEigenkapital).toBe(0);
    expect(r.tragbar).toBe(true);
  });

  // 2. Kalkulatorischer Zins korrekt
  it('kalkulatorischer Zins ist 5%', () => {
    const r = calcTragbarkeit(base);
    expect(r.kalkZins).toBe(5);
    expect(r.kalkZinsKosten).toBe(40_000);
  });

  // 3. Nebenkosten 1% vom Immobilienwert
  it('Nebenkosten-Pauschale ist 1% vom Immobilienwert', () => {
    const r = calcTragbarkeit(base);
    expect(r.nebenkostenPauschale).toBe(10_000);
  });

  // 4. Amortisation: 2. Hypothek über 66%
  it('berechnet Amortisation der 2. Hypothek korrekt', () => {
    const r = calcTragbarkeit(base);
    // Hypothek 800k, 1. Hypo bis 660k, 2. Hypo = 140k, Amortisation in 15J
    expect(r.amortisation).toBeCloseTo(140_000 / 15, 0);
  });

  // 5. Tragbarkeit unter 33%
  it('tragbar bei ausreichendem Einkommen', () => {
    const r = calcTragbarkeit({ ...base, bruttoeinkommen: 250_000 });
    expect(r.tragbar).toBe(true);
    expect(r.tragbarkeitRatio).toBeLessThan(33);
  });

  // 6. Tragbarkeit über 33%
  it('nicht tragbar bei zu niedrigem Einkommen', () => {
    const r = calcTragbarkeit({ ...base, bruttoeinkommen: 100_000 });
    expect(r.tragbar).toBe(false);
    expect(r.tragbarkeitRatio).toBeGreaterThan(33);
  });

  // 7. Fehlendes Eigenkapital
  it('erkennt fehlendes Eigenkapital', () => {
    const r = calcTragbarkeit({ ...base, eigenkapital: 100_000 });
    expect(r.fehlendesEigenkapital).toBe(100_000);
  });

  // 8. Genug Eigenkapital = 0 fehlend
  it('kein fehlendes EK bei ausreichend', () => {
    const r = calcTragbarkeit({ ...base, eigenkapital: 300_000 });
    expect(r.fehlendesEigenkapital).toBe(0);
  });

  // 9. Null-Immobilienwert
  it('Null-Immobilienwert ergibt alles 0', () => {
    const r = calcTragbarkeit({ immobilienwert: 0, bruttoeinkommen: 200_000, eigenkapital: 200_000 });
    expect(r.hypothek).toBe(0);
    expect(r.jaehrlicheWohnkosten).toBe(0);
  });

  // 10. Monatliche Wohnkosten korrekt
  it('monatliche = jährliche / 12', () => {
    const r = calcTragbarkeit(base);
    expect(r.monatlicheWohnkosten).toBe(Math.round(r.jaehrlicheWohnkosten / 12));
  });

  // 11. Benötigtes Einkommen korrekt
  it('benötigtes Einkommen = Wohnkosten / 0.33', () => {
    const r = calcTragbarkeit(base);
    expect(r.benoetigtesEinkommen).toBeCloseTo(r.jaehrlicheWohnkosten / 0.33, -2);
  });

  // 12. Extreme: sehr teure Immobilie
  it('funktioniert mit CHF 5M Immobilie', () => {
    const r = calcTragbarkeit({ immobilienwert: 5_000_000, bruttoeinkommen: 500_000, eigenkapital: 1_000_000 });
    expect(r.hypothek).toBe(4_000_000);
    expect(r.tragbar).toBe(false); // 500k reicht nicht für 5M
  });

  // 13. Eigenkapital > Immobilienwert
  it('EK über Immobilienwert: keine Hypothek', () => {
    const r = calcTragbarkeit({ ...base, eigenkapital: 1_500_000 });
    expect(r.hypothek).toBe(0);
    expect(r.amortisation).toBe(0);
    expect(r.kalkZinsKosten).toBe(0);
  });

  // 14. Zod: negativer Immobilienwert
  it('wirft bei negativem Immobilienwert', () => {
    expect(() => calcTragbarkeit({ ...base, immobilienwert: -1 })).toThrow();
  });

  // 15. Konsistenz: Wohnkosten = Zins + Nebenkosten + Amortisation
  it('Wohnkosten = Summe der Teilkosten', () => {
    const r = calcTragbarkeit(base);
    expect(r.jaehrlicheWohnkosten).toBe(r.kalkZinsKosten + r.nebenkostenPauschale + r.amortisation);
  });
});
