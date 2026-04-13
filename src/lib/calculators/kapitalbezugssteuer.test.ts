import { describe, it, expect } from 'vitest';
import { calcKapitalbezugssteuer, type KapitalbezugssteuerInput } from './kapitalbezugssteuer';

const base: KapitalbezugssteuerInput = {
  bezugsbetrag: 200000,
  kanton: 'ZH',
  zivilstand: 'ledig',
};

describe('Kapitalbezugssteuer-Rechner', () => {
  it('Standardfall ZH 200k ledig', () => {
    const r = calcKapitalbezugssteuer(base);
    expect(r.steuerBetrag).toBeGreaterThan(5000);
    expect(r.steuerBetrag).toBeLessThan(30000);
    expect(r.nettoAuszahlung).toBe(200000 - r.steuerBetrag);
  });

  it('Betrag 0 ergibt 0 Steuer', () => {
    const r = calcKapitalbezugssteuer({ ...base, bezugsbetrag: 0 });
    expect(r.steuerBetrag).toBe(0);
    expect(r.nettoAuszahlung).toBe(0);
  });

  it('Verheiratete zahlen weniger', () => {
    const rLedig = calcKapitalbezugssteuer(base);
    const rVerh = calcKapitalbezugssteuer({ ...base, zivilstand: 'verheiratet' });
    expect(rVerh.steuerBetrag).toBeLessThan(rLedig.steuerBetrag);
  });

  it('ZG hat tiefste Saetze', () => {
    const kantone = ['ZH', 'BE', 'VD', 'GE', 'AG', 'ZG', 'BS'] as const;
    const results = kantone.map(k => calcKapitalbezugssteuer({ ...base, kanton: k }));
    const zg = results.find((_, i) => kantone[i] === 'ZG')!;
    results.forEach(r => expect(zg.steuerBetrag).toBeLessThanOrEqual(r.steuerBetrag));
  });

  it('progressiver Satz: hoeherer Betrag -> hoeherer Satz', () => {
    const r100 = calcKapitalbezugssteuer({ ...base, bezugsbetrag: 100000 });
    const r500 = calcKapitalbezugssteuer({ ...base, bezugsbetrag: 500000 });
    expect(r500.effektiverSatz).toBeGreaterThan(r100.effektiverSatz);
  });

  it('Bund + Kanton = Gesamt', () => {
    const r = calcKapitalbezugssteuer(base);
    expect(r.steuerBund + r.steuerKantonGemeinde).toBeCloseTo(r.steuerBetrag, 0);
  });

  it('Bundesanteil ist ca. 25% der Gesamtsteuer', () => {
    const r = calcKapitalbezugssteuer(base);
    expect(r.steuerBund).toBeCloseTo(r.steuerBetrag * 0.25, 0);
  });

  it('alle 7 Kantone valides Ergebnis', () => {
    const kantone = ['ZH', 'BE', 'VD', 'GE', 'AG', 'ZG', 'BS'] as const;
    kantone.forEach(k => {
      const r = calcKapitalbezugssteuer({ ...base, kanton: k });
      expect(r.steuerBetrag).toBeGreaterThan(0);
      expect(r.effektiverSatz).toBeGreaterThan(0);
      expect(r.effektiverSatz).toBeLessThan(20);
    });
  });

  it('kleiner Betrag (50k) hat tieferen Satz als grosser (1M)', () => {
    const r50 = calcKapitalbezugssteuer({ ...base, bezugsbetrag: 50000 });
    const r1M = calcKapitalbezugssteuer({ ...base, bezugsbetrag: 1000000 });
    expect(r1M.effektiverSatz).toBeGreaterThan(r50.effektiverSatz);
  });

  it('negativer Betrag wirft Fehler', () => {
    expect(() => calcKapitalbezugssteuer({ ...base, bezugsbetrag: -1 })).toThrow();
  });

  it('effektiver Satz zwischen 0% und 20%', () => {
    const r = calcKapitalbezugssteuer(base);
    expect(r.effektiverSatz).toBeGreaterThan(0);
    expect(r.effektiverSatz).toBeLessThan(20);
  });

  it('Netto + Steuer = Bezugsbetrag', () => {
    const r = calcKapitalbezugssteuer(base);
    expect(r.nettoAuszahlung + r.steuerBetrag).toBeCloseTo(200000, 0);
  });
});
