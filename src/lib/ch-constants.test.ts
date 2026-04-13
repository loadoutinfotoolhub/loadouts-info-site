import { describe, it, expect } from 'vitest';
import { CH2026 } from './ch-constants';

describe('CH2026 SSOT Constants', () => {
  it('parses without error', () => {
    expect(CH2026).toBeDefined();
    expect(CH2026.version).toBe('2026.1');
  });

  it('has correct Saeule 3a values', () => {
    expect(CH2026.saeule3a.maxMitPK).toBe(7258);
    expect(CH2026.saeule3a.maxOhnePK).toBe(36288);
    expect(CH2026.saeule3a.maxProzentOhnePK).toBe(0.20);
  });

  it('has correct Sozialversicherung rates', () => {
    expect(CH2026.sozialversicherung.ahv).toBe(0.053);
    expect(CH2026.sozialversicherung.iv).toBe(0.007);
    expect(CH2026.sozialversicherung.eo).toBe(0.0025);
    expect(CH2026.sozialversicherung.alv).toBe(0.011);
    expect(CH2026.sozialversicherung.alvMaxEinkommen).toBe(148200);
  });

  it('has correct BVG values', () => {
    expect(CH2026.bvg.eintrittsschwelle).toBe(22680);
    expect(CH2026.bvg.koordinationsabzug).toBe(26460);
    expect(CH2026.bvg.maxVersLohn).toBe(90720);
    expect(CH2026.bvg.umwandlungssatz).toBe(0.068);
  });

  it('has correct BVG contribution rates by age', () => {
    expect(CH2026.bvg.beitragssaetze['25_34']).toBe(0.07);
    expect(CH2026.bvg.beitragssaetze['35_44']).toBe(0.10);
    expect(CH2026.bvg.beitragssaetze['45_54']).toBe(0.15);
    expect(CH2026.bvg.beitragssaetze['55_65']).toBe(0.18);
  });

  it('has correct AHV pension values', () => {
    expect(CH2026.ahvRenten.maxEinzelMonat).toBe(2450);
    expect(CH2026.ahvRenten.minEinzelMonat).toBe(1225);
    expect(CH2026.ahvRenten.maxEhepaarMonat).toBe(3675);
  });

  it('has correct mortgage values', () => {
    expect(CH2026.hypothek.kalkZins).toBe(0.05);
    expect(CH2026.hypothek.tragbarkeitMax).toBe(0.33);
    expect(CH2026.hypothek.eigenkapitalMin).toBe(0.20);
    expect(CH2026.hypothek.eigenkapitalHartMin).toBe(0.10);
    expect(CH2026.hypothek.amortisationJahre).toBe(15);
  });

  it('has correct MwSt rates', () => {
    expect(CH2026.mwst.normal).toBe(0.081);
    expect(CH2026.mwst.reduziert).toBe(0.026);
    expect(CH2026.mwst.beherbergung).toBe(0.038);
  });

  it('has valid source URLs', () => {
    for (const [key, source] of Object.entries(CH2026.sources)) {
      expect(source.url).toMatch(/^https?:\/\//);
      expect(source.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('effective date is 2026', () => {
    expect(CH2026.effectiveFrom).toBe('2026-01-01');
  });
});
