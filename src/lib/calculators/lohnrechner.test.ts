import { describe, it, expect } from 'vitest';
import { calcLohnrechner, type LohnrechnerInput } from './lohnrechner';

const base: LohnrechnerInput = {
  bruttolohn: 7083, // ~85'000 p.a.
  kanton: 'ZH',
  zivilstand: 'ledig',
  konfession: 'keine',
  alter: 35,
  dreizehnterMonatslohn: false,
};

describe('Lohnrechner Netto/Brutto', () => {
  // 1. Happy Path: Standard-Fall ZH
  it('berechnet Standardfall ZH korrekt', () => {
    const r = calcLohnrechner(base);
    expect(r.jahresBrutto).toBe(84996);
    expect(r.ahv).toBeGreaterThan(0);
    expect(r.iv).toBeGreaterThan(0);
    expect(r.eo).toBeGreaterThan(0);
    expect(r.alv).toBeGreaterThan(0);
    expect(r.bvg).toBeGreaterThan(0);
    expect(r.steuer).toBeGreaterThan(0);
    expect(r.jahresNetto).toBeGreaterThan(50000);
    expect(r.jahresNetto).toBeLessThan(80000);
    expect(r.grenzSteuersatz).toBeGreaterThan(10);
    expect(r.grenzSteuersatz).toBeLessThan(40);
  });

  // 2. AHV-Beitrag korrekt (5.3%)
  it('AHV-Beitrag ist exakt 5.3% vom Brutto', () => {
    const r = calcLohnrechner({ ...base, bruttolohn: 10000 });
    expect(r.ahv).toBeCloseTo(120000 * 0.053, 1);
  });

  // 3. IV-Beitrag korrekt (0.7%)
  it('IV-Beitrag ist exakt 0.7% vom Brutto', () => {
    const r = calcLohnrechner({ ...base, bruttolohn: 10000 });
    expect(r.iv).toBeCloseTo(120000 * 0.007, 1);
  });

  // 4. EO-Beitrag korrekt (0.25%)
  it('EO-Beitrag ist exakt 0.25% vom Brutto', () => {
    const r = calcLohnrechner({ ...base, bruttolohn: 10000 });
    expect(r.eo).toBeCloseTo(120000 * 0.0025, 1);
  });

  // 5. ALV gedeckelt bei CHF 148'200
  it('ALV ist bei CHF 148200 gedeckelt', () => {
    const lowR = calcLohnrechner({ ...base, bruttolohn: 10000 }); // 120k
    const highR = calcLohnrechner({ ...base, bruttolohn: 20000 }); // 240k
    expect(lowR.alv).toBeCloseTo(120000 * 0.011, 1);
    expect(highR.alv).toBeCloseTo(148200 * 0.011, 1);
  });

  // 6. BVG altersabhängig: 25-34 = 7%
  it('BVG für Alter 30 ist 7% Gesamtrate', () => {
    const r = calcLohnrechner({ ...base, alter: 30 });
    // Koordinierter Lohn = brutto - 26460, max 90720 - 26460
    const koordiniert = Math.min(84996 - 26460, 90720 - 26460);
    expect(r.bvg).toBeCloseTo(koordiniert * 0.07 * 0.5, 0);
  });

  // 7. BVG altersabhängig: 35-44 = 10%
  it('BVG für Alter 40 ist 10% Gesamtrate', () => {
    const r = calcLohnrechner({ ...base, alter: 40 });
    const koordiniert = Math.min(84996 - 26460, 90720 - 26460);
    expect(r.bvg).toBeCloseTo(koordiniert * 0.10 * 0.5, 0);
  });

  // 8. BVG altersabhängig: 55-65 = 18%
  it('BVG für Alter 60 ist 18% Gesamtrate', () => {
    const r = calcLohnrechner({ ...base, alter: 60 });
    const koordiniert = Math.min(84996 - 26460, 90720 - 26460);
    expect(r.bvg).toBeCloseTo(koordiniert * 0.18 * 0.5, 0);
  });

  // 9. Unter BVG-Eintrittsschwelle: kein BVG
  it('kein BVG unter Eintrittsschwelle CHF 22680', () => {
    const r = calcLohnrechner({ ...base, bruttolohn: 1800 }); // 21600 p.a.
    expect(r.bvg).toBe(0);
  });

  // 10. 13. Monatslohn erhöht Jahresbrutto
  it('13. Monatslohn erhöht Jahresbrutto um 1 Monat', () => {
    const ohne = calcLohnrechner({ ...base, dreizehnterMonatslohn: false });
    const mit = calcLohnrechner({ ...base, dreizehnterMonatslohn: true });
    expect(mit.jahresBrutto).toBeCloseTo(ohne.jahresBrutto * 13 / 12, 0);
  });

  // 11. Kanton ZG: tiefe Steuern
  it('ZG hat tiefere Steuern als GE', () => {
    const zg = calcLohnrechner({ ...base, kanton: 'ZG' });
    const ge = calcLohnrechner({ ...base, kanton: 'GE' });
    expect(zg.steuer).toBeLessThan(ge.steuer);
    expect(zg.jahresNetto).toBeGreaterThan(ge.jahresNetto);
  });

  // 12. Kanton GE: höchste Steuern der 7
  it('GE hat die höchsten Steuern', () => {
    const results = (['ZH', 'BE', 'VD', 'GE', 'AG', 'ZG', 'BS'] as const).map(k =>
      calcLohnrechner({ ...base, kanton: k })
    );
    const geSteuer = results[3].steuer;
    results.forEach((r, i) => {
      if (i !== 3) expect(geSteuer).toBeGreaterThanOrEqual(r.steuer);
    });
  });

  // 13. Verheiratet: tiefere Steuern
  it('Verheiratete zahlen weniger Steuern als Ledige', () => {
    const ledig = calcLohnrechner({ ...base, zivilstand: 'ledig' });
    const verh = calcLohnrechner({ ...base, zivilstand: 'verheiratet' });
    expect(verh.steuer).toBeLessThan(ledig.steuer);
  });

  // 14. Kirchensteuer: reformiert hat Zuschlag
  it('Reformierte zahlen Kirchensteuer', () => {
    const ohne = calcLohnrechner({ ...base, konfession: 'keine' });
    const ref = calcLohnrechner({ ...base, konfession: 'reformiert' });
    expect(ref.kirchensteuer).toBeGreaterThan(0);
    expect(ohne.kirchensteuer).toBe(0);
    expect(ref.totalAbzuege).toBeGreaterThan(ohne.totalAbzuege);
  });

  // 15. Null-Brutto
  it('Bruttolohn 0 ergibt alles 0', () => {
    const r = calcLohnrechner({ ...base, bruttolohn: 0 });
    expect(r.jahresBrutto).toBe(0);
    expect(r.jahresNetto).toBe(0);
    expect(r.totalAbzuege).toBe(0);
  });

  // 16. Minimallohn
  it('funktioniert mit Minimallohn CHF 1000/Monat', () => {
    const r = calcLohnrechner({ ...base, bruttolohn: 1000 });
    expect(r.jahresNetto).toBeGreaterThan(0);
    expect(r.jahresNetto).toBeLessThan(12000);
  });

  // 17. Extreme Werte: hohes Einkommen
  it('funktioniert mit CHF 50000/Monat', () => {
    const r = calcLohnrechner({ ...base, bruttolohn: 50000 });
    expect(r.jahresBrutto).toBe(600000);
    expect(r.jahresNetto).toBeGreaterThan(300000);
    expect(r.jahresNetto).toBeLessThan(500000);
  });

  // 18. Konsistenzcheck: Netto = Brutto - Abzüge
  it('Netto + Abzüge = Brutto', () => {
    const r = calcLohnrechner(base);
    expect(r.jahresNetto + r.totalAbzuege).toBeCloseTo(r.jahresBrutto, 1);
  });

  // 19. MonatsNetto korrekt berechnet
  it('MonatsNetto = JahresNetto / Monate', () => {
    const r12 = calcLohnrechner({ ...base, dreizehnterMonatslohn: false });
    expect(r12.monatsNetto).toBeCloseTo(r12.jahresNetto / 12, 0);
    const r13 = calcLohnrechner({ ...base, dreizehnterMonatslohn: true });
    expect(r13.monatsNetto).toBeCloseTo(r13.jahresNetto / 13, 0);
  });

  // 20. Grenzsteuersatz ist positiv und vernünftig
  it('Grenzsteuersatz zwischen 0% und 50%', () => {
    const r = calcLohnrechner(base);
    expect(r.grenzSteuersatz).toBeGreaterThanOrEqual(0);
    expect(r.grenzSteuersatz).toBeLessThanOrEqual(50);
  });

  // 21. Alter unter 25: kein BVG
  it('unter 25 kein BVG', () => {
    const r = calcLohnrechner({ ...base, alter: 22 });
    expect(r.bvg).toBe(0);
  });

  // 22. Zod-Validierung: negativer Bruttolohn
  it('wirft bei negativem Bruttolohn', () => {
    expect(() => calcLohnrechner({ ...base, bruttolohn: -1000 })).toThrow();
  });

  // 23. Zod-Validierung: ungültiger Kanton
  it('wirft bei ungültigem Kanton', () => {
    expect(() => calcLohnrechner({ ...base, kanton: 'XX' as any })).toThrow();
  });

  // 24. Alle 7 Kantone liefern valide Ergebnisse
  it('alle 7 Kantone funktionieren', () => {
    for (const k of ['ZH', 'BE', 'VD', 'GE', 'AG', 'ZG', 'BS'] as const) {
      const r = calcLohnrechner({ ...base, kanton: k });
      expect(r.jahresNetto).toBeGreaterThan(0);
      expect(r.steuer).toBeGreaterThanOrEqual(0);
    }
  });
});
