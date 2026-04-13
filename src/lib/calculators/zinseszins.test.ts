import { describe, it, expect } from 'vitest';
import { calcZinseszins, type ZinseszinsInput } from './zinseszins';

const base: ZinseszinsInput = {
  startkapital: 10000,
  monatlicheEinzahlung: 500,
  zinssatz: 5,
  laufzeit: 10,
};

describe('Zinseszinsrechner', () => {
  it('berechnet Standardfall korrekt', () => {
    const r = calcZinseszins(base);
    expect(r.endkapital).toBeGreaterThan(70000);
    expect(r.totalEinzahlungen).toBe(70000); // 10k + 500*12*10
    expect(r.totalZinsen).toBeGreaterThan(0);
  });

  it('nur Startkapital ohne Einzahlungen', () => {
    const r = calcZinseszins({ ...base, monatlicheEinzahlung: 0 });
    expect(r.endkapital).toBeGreaterThan(base.startkapital);
    expect(r.totalEinzahlungen).toBe(base.startkapital);
  });

  it('nur Einzahlungen ohne Startkapital', () => {
    const r = calcZinseszins({ ...base, startkapital: 0 });
    expect(r.endkapital).toBeGreaterThan(0);
    expect(r.totalEinzahlungen).toBe(500 * 12 * 10);
  });

  it('Zinssatz 0% ergibt reinen Sparbetrag', () => {
    const r = calcZinseszins({ ...base, zinssatz: 0 });
    expect(r.endkapital).toBe(70000);
    expect(r.totalZinsen).toBe(0);
  });

  it('1 Jahr Laufzeit', () => {
    const r = calcZinseszins({ ...base, laufzeit: 1 });
    expect(r.jahreDaten).toHaveLength(1);
    expect(r.endkapital).toBeGreaterThan(15000);
  });

  it('jahreDaten hat korrekte Laenge', () => {
    const r = calcZinseszins(base);
    expect(r.jahreDaten).toHaveLength(10);
    expect(r.jahreDaten[9].kapital).toBeCloseTo(r.endkapital, 0);
  });

  it('Kapital waechst monoton', () => {
    const r = calcZinseszins(base);
    for (let i = 1; i < r.jahreDaten.length; i++) {
      expect(r.jahreDaten[i].kapital).toBeGreaterThan(r.jahreDaten[i - 1].kapital);
    }
  });

  it('hoher Zinssatz ergibt deutlich mehr', () => {
    const r5 = calcZinseszins({ ...base, zinssatz: 5 });
    const r10 = calcZinseszins({ ...base, zinssatz: 10 });
    expect(r10.endkapital).toBeGreaterThan(r5.endkapital * 1.3);
  });

  it('Zinsenanteil ist plausibel', () => {
    const r = calcZinseszins(base);
    expect(r.zinsenAnteil).toBeGreaterThan(5);
    expect(r.zinsenAnteil).toBeLessThan(80);
  });

  it('negativer Startkapital wirft Fehler', () => {
    expect(() => calcZinseszins({ ...base, startkapital: -1 })).toThrow();
  });

  it('Laufzeit 0 wirft Fehler', () => {
    expect(() => calcZinseszins({ ...base, laufzeit: 0 })).toThrow();
  });

  it('30 Jahre Sparplan zeigt Zinseszins-Effekt', () => {
    const r = calcZinseszins({ ...base, laufzeit: 30 });
    expect(r.totalZinsen).toBeGreaterThan(r.totalEinzahlungen);
  });
});
