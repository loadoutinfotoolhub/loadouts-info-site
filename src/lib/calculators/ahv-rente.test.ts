import { describe, it, expect } from 'vitest';
import { calcAhvRente, type AhvRenteInput } from './ahv-rente';

const base: AhvRenteInput = {
  beitragsjahre: 44,
  durchschnittlichesEinkommen: 85000,
  zivilstand: 'ledig',
};

describe('AHV-Rentenrechner', () => {
  it('volle Beitragsjahre + hohes Einkommen = nahe Maximalrente', () => {
    const r = calcAhvRente(base);
    expect(r.monatsrente).toBeGreaterThan(2400);
    expect(r.monatsrente).toBeLessThanOrEqual(2520);
    expect(r.rentenSkala).toBe(44);
  });

  it('Maximalrente bei Maximaleinkommen', () => {
    const r = calcAhvRente({ ...base, durchschnittlichesEinkommen: 100000 });
    expect(r.monatsrente).toBe(2520);
  });

  it('Minimalrente bei tiefem Einkommen', () => {
    const r = calcAhvRente({ ...base, durchschnittlichesEinkommen: 14700 });
    expect(r.monatsrente).toBe(1260);
  });

  it('fehlende Beitragsjahre reduzieren Rente', () => {
    const rVoll = calcAhvRente(base);
    const r30 = calcAhvRente({ ...base, beitragsjahre: 30 });
    expect(r30.monatsrente).toBeLessThan(rVoll.monatsrente);
    expect(r30.lueckeInfo).toContain('14');
  });

  it('Ehepaar-Plafonierung greift', () => {
    const r = calcAhvRente({ ...base, zivilstand: 'verheiratet' });
    expect(r.plafoniert).toBe(true);
    expect(r.monatsrente * 2).toBeLessThanOrEqual(3780);
  });

  it('tiefer verheirateter Lohn: keine Plafonierung', () => {
    const r = calcAhvRente({ ...base, zivilstand: 'verheiratet', durchschnittlichesEinkommen: 30000 });
    expect(r.plafoniert).toBe(false);
  });

  it('Einkommen 0 ergibt 0 Rente', () => {
    const r = calcAhvRente({ ...base, durchschnittlichesEinkommen: 0 });
    expect(r.monatsrente).toBe(0);
  });

  it('Jahresrente = 12x Monatsrente', () => {
    const r = calcAhvRente(base);
    expect(r.jahresrente).toBeCloseTo(r.monatsrente * 12, 0);
  });

  it('1 Beitragsjahr ergibt sehr tiefe Rente', () => {
    const r = calcAhvRente({ ...base, beitragsjahre: 1 });
    expect(r.monatsrente).toBeLessThan(100);
  });

  it('negativer Beitragsjahre wirft Fehler', () => {
    expect(() => calcAhvRente({ ...base, beitragsjahre: 0 })).toThrow();
  });

  it('maxRente fuer Ledige ist 2520', () => {
    const r = calcAhvRente(base);
    expect(r.maxRente).toBe(2520);
  });

  it('maxRente fuer Verheiratete ist 3780', () => {
    const r = calcAhvRente({ ...base, zivilstand: 'verheiratet' });
    expect(r.maxRente).toBe(3780);
  });
});
