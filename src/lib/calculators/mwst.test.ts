import { describe, it, expect } from 'vitest';
import { calcMwst, type MwstInput } from './mwst';

const base: MwstInput = { betrag: 100, satz: 'normal', richtung: 'exkl' };

describe('MwSt-Rechner', () => {
  it('exkl -> inkl: 100 CHF + 8.1% = 108.10', () => {
    const r = calcMwst(base);
    expect(r.betragExkl).toBe(100);
    expect(r.mwstBetrag).toBe(8.10);
    expect(r.betragInkl).toBe(108.10);
  });

  it('inkl -> exkl: 108.10 ergibt 100 exkl', () => {
    const r = calcMwst({ betrag: 108.10, satz: 'normal', richtung: 'inkl' });
    expect(r.betragExkl).toBeCloseTo(100, 1);
    expect(r.mwstBetrag).toBeCloseTo(8.10, 1);
  });

  it('reduzierter Satz 2.6%', () => {
    const r = calcMwst({ ...base, satz: 'reduziert' });
    expect(r.mwstBetrag).toBe(2.60);
    expect(r.mwstSatz).toBe(2.6);
  });

  it('Beherbergungssatz 3.8%', () => {
    const r = calcMwst({ ...base, satz: 'beherbergung' });
    expect(r.mwstBetrag).toBe(3.80);
    expect(r.mwstSatz).toBe(3.8);
  });

  it('Betrag 0 ergibt 0', () => {
    const r = calcMwst({ ...base, betrag: 0 });
    expect(r.mwstBetrag).toBe(0);
    expect(r.betragInkl).toBe(0);
    expect(r.betragExkl).toBe(0);
  });

  it('grosser Betrag korrekt', () => {
    const r = calcMwst({ ...base, betrag: 1000000 });
    expect(r.mwstBetrag).toBe(81000);
    expect(r.betragInkl).toBe(1081000);
  });

  it('negativer Betrag wirft Fehler', () => {
    expect(() => calcMwst({ ...base, betrag: -1 })).toThrow();
  });

  it('Normalsatz ist 8.1%', () => {
    const r = calcMwst(base);
    expect(r.mwstSatz).toBe(8.1);
  });

  it('inkl und exkl sind konsistent', () => {
    const rExkl = calcMwst({ betrag: 200, satz: 'normal', richtung: 'exkl' });
    const rInkl = calcMwst({ betrag: rExkl.betragInkl, satz: 'normal', richtung: 'inkl' });
    expect(rInkl.betragExkl).toBeCloseTo(200, 1);
  });

  it('alle 3 Saetze unterschiedlich', () => {
    const rN = calcMwst({ ...base, satz: 'normal' });
    const rR = calcMwst({ ...base, satz: 'reduziert' });
    const rB = calcMwst({ ...base, satz: 'beherbergung' });
    expect(rN.mwstSatz).toBeGreaterThan(rB.mwstSatz);
    expect(rB.mwstSatz).toBeGreaterThan(rR.mwstSatz);
  });
});
