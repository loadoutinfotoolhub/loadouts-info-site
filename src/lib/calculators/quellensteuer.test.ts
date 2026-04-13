import { describe, it, expect } from 'vitest';
import { calcQuellensteuer, type QuellensteuerInput, getTarifBeschreibung } from './quellensteuer';

const base: QuellensteuerInput = {
  bruttolohn: 7000, // CHF 7'000/Monat = 84'000 p.a.
  kanton: 'ZH',
  tarif: 'A0',
  konfession: 'keine',
  bewilligung: 'B',
  kinderAnzahl: 0,
};

describe('Quellensteuer-Rechner', () => {
  // 1. Happy Path: Standardfall ZH A0
  it('berechnet Standardfall ZH A0 korrekt', () => {
    const r = calcQuellensteuer(base);
    expect(r.jahresbrutto).toBe(84000);
    expect(r.quellensteuerBetrag).toBeGreaterThan(5000);
    expect(r.quellensteuerBetrag).toBeLessThan(20000);
    expect(r.effektiverSteuersatz).toBeGreaterThan(5);
    expect(r.effektiverSteuersatz).toBeLessThan(25);
    expect(r.quellensteuerMonat).toBeCloseTo(r.quellensteuerBetrag / 12, 0);
  });

  // 2. NOV-Pflicht ab CHF 120'000
  it('NOV-Pflicht bei Jahresbrutto >= 120000', () => {
    const r = calcQuellensteuer({ ...base, bruttolohn: 10000 });
    expect(r.jahresbrutto).toBe(120000);
    expect(r.nachtraeglicheVeranlagungPflicht).toBe(true);
  });

  // 3. Keine NOV-Pflicht unter 120'000
  it('keine NOV-Pflicht unter 120000', () => {
    const r = calcQuellensteuer({ ...base, bruttolohn: 9999 });
    expect(r.nachtraeglicheVeranlagungPflicht).toBe(false);
  });

  // 4. NOV-Empfehlung zwischen 80'000 und 120'000
  it('NOV-Empfehlung bei mittlerem Einkommen', () => {
    const r = calcQuellensteuer({ ...base, bruttolohn: 7500 }); // 90'000 p.a.
    expect(r.empfehlungNovAntrag).toBe(true);
  });

  // 5. Keine NOV-Empfehlung unter 80'000
  it('keine NOV-Empfehlung bei tiefem Einkommen', () => {
    const r = calcQuellensteuer({ ...base, bruttolohn: 5000 }); // 60'000 p.a.
    expect(r.empfehlungNovAntrag).toBe(false);
  });

  // 6. Bruttolohn 0 ergibt 0 Quellensteuer
  it('Bruttolohn 0 ergibt 0 Steuer', () => {
    const r = calcQuellensteuer({ ...base, bruttolohn: 0 });
    expect(r.quellensteuerBetrag).toBe(0);
    expect(r.effektiverSteuersatz).toBe(0);
  });

  // 7. Tarif B (verheiratet) ist tiefer als A
  it('Tarif B ist tiefer als Tarif A', () => {
    const rA = calcQuellensteuer({ ...base, tarif: 'A0' });
    const rB = calcQuellensteuer({ ...base, tarif: 'B0' });
    expect(rB.quellensteuerBetrag).toBeLessThan(rA.quellensteuerBetrag);
  });

  // 8. Kinder senken die Quellensteuer
  it('Kinder senken die Quellensteuer', () => {
    const r0 = calcQuellensteuer({ ...base, tarif: 'B0' });
    const r2 = calcQuellensteuer({ ...base, tarif: 'B2' });
    expect(r2.quellensteuerBetrag).toBeLessThan(r0.quellensteuerBetrag);
  });

  // 9. Konfession erhoegt die Quellensteuer
  it('Konfession erhoegt die Quellensteuer', () => {
    const rKeine = calcQuellensteuer({ ...base, konfession: 'keine' });
    const rRef = calcQuellensteuer({ ...base, konfession: 'reformiert' });
    expect(rRef.quellensteuerBetrag).toBeGreaterThan(rKeine.quellensteuerBetrag);
  });

  // 10. Kanton ZG hat tiefste Saetze
  it('Kanton ZG hat tiefsten Satz', () => {
    const kantone = ['ZH', 'BE', 'VD', 'GE', 'AG', 'ZG', 'BS'] as const;
    const results = kantone.map(k => calcQuellensteuer({ ...base, kanton: k }));
    const zgResult = results.find((_, i) => kantone[i] === 'ZG')!;
    results.forEach(r => {
      expect(zgResult.quellensteuerBetrag).toBeLessThanOrEqual(r.quellensteuerBetrag);
    });
  });

  // 11. Kanton GE hat hoechste Saetze
  it('Kanton GE hat hoechsten Satz', () => {
    const kantone = ['ZH', 'BE', 'VD', 'GE', 'AG', 'ZG', 'BS'] as const;
    const results = kantone.map(k => calcQuellensteuer({ ...base, kanton: k }));
    const geResult = results.find((_, i) => kantone[i] === 'GE')!;
    results.forEach(r => {
      expect(geResult.quellensteuerBetrag).toBeGreaterThanOrEqual(r.quellensteuerBetrag);
    });
  });

  // 12. Effektiver Steuersatz ist positiv und unter 50%
  it('Effektiver Steuersatz zwischen 0% und 50%', () => {
    const r = calcQuellensteuer(base);
    expect(r.effektiverSteuersatz).toBeGreaterThan(0);
    expect(r.effektiverSteuersatz).toBeLessThan(50);
  });

  // 13. Hohes Einkommen (500k) hat hohen Satz
  it('hohes Einkommen hat hohen Effektivsatz', () => {
    const r = calcQuellensteuer({ ...base, bruttolohn: 42000 }); // 504'000 p.a.
    expect(r.effektiverSteuersatz).toBeGreaterThan(20);
  });

  // 14. Tarif H (Alleinerziehend) liegt zwischen A und B
  it('Tarif H liegt zwischen A und B', () => {
    const rA = calcQuellensteuer({ ...base, tarif: 'A1' });
    const rH = calcQuellensteuer({ ...base, tarif: 'H1' });
    const rB = calcQuellensteuer({ ...base, tarif: 'B1' });
    expect(rH.quellensteuerBetrag).toBeLessThan(rA.quellensteuerBetrag);
    expect(rH.quellensteuerBetrag).toBeGreaterThan(rB.quellensteuerBetrag);
  });

  // 15. Tarif C (Doppelverdiener) liegt zwischen A und B
  it('Tarif C liegt zwischen A und B', () => {
    const rA = calcQuellensteuer({ ...base, tarif: 'A0' });
    const rC = calcQuellensteuer({ ...base, tarif: 'C0' });
    const rB = calcQuellensteuer({ ...base, tarif: 'B0' });
    expect(rC.quellensteuerBetrag).toBeLessThan(rA.quellensteuerBetrag);
    expect(rC.quellensteuerBetrag).toBeGreaterThan(rB.quellensteuerBetrag);
  });

  // 16. Tarif-Beschreibung DE
  it('Tarif-Beschreibung korrekt DE', () => {
    expect(getTarifBeschreibung('A0', 'de')).toBe('Alleinstehend, keine Kinder');
    expect(getTarifBeschreibung('B2', 'de')).toBe('Verheiratet, Alleinverdiener, 2 Kinder');
    expect(getTarifBeschreibung('H1', 'de')).toBe('Alleinerziehend, 1 Kind');
  });

  // 17. Tarif-Beschreibung EN
  it('Tarif-Beschreibung korrekt EN', () => {
    expect(getTarifBeschreibung('A0', 'en')).toBe('Single, no children');
    expect(getTarifBeschreibung('B2', 'en')).toBe('Married, sole earner, 2 children');
    expect(getTarifBeschreibung('H1', 'en')).toBe('Single parent, 1 child');
  });

  // 18. Quellensteuer-Monat ist exakt 1/12 des Jahresbetrags
  it('Monatssteuer ist 1/12 der Jahressteuer', () => {
    const r = calcQuellensteuer(base);
    expect(r.quellensteuerMonat).toBeCloseTo(r.quellensteuerBetrag / 12, 1);
  });

  // 19. Alle 7 Kantone ergeben valides Ergebnis
  it('alle 7 Kantone ergeben valides Ergebnis', () => {
    const kantone = ['ZH', 'BE', 'VD', 'GE', 'AG', 'ZG', 'BS'] as const;
    kantone.forEach(k => {
      const r = calcQuellensteuer({ ...base, kanton: k });
      expect(r.quellensteuerBetrag).toBeGreaterThan(0);
      expect(r.effektiverSteuersatz).toBeGreaterThan(0);
      expect(r.jahresbrutto).toBe(84000);
    });
  });

  // 20. Validierung: negativer Bruttolohn wird abgefangen
  it('negativer Bruttolohn wirft Fehler', () => {
    expect(() => calcQuellensteuer({ ...base, bruttolohn: -1 })).toThrow();
  });

  // 21. Validierung: ungueltiger Kanton wird abgefangen
  it('ungueltiger Kanton wirft Fehler', () => {
    expect(() => calcQuellensteuer({ ...base, kanton: 'XX' as any })).toThrow();
  });

  // 22. Extremer Bruttolohn (sehr hoch)
  it('extremer Bruttolohn ergibt hohen Satz', () => {
    const r = calcQuellensteuer({ ...base, bruttolohn: 100000 }); // 1.2M p.a.
    expect(r.effektiverSteuersatz).toBeGreaterThan(15);
    expect(r.nachtraeglicheVeranlagungPflicht).toBe(true);
  });

  // 23. Minimaler Bruttolohn (1 CHF)
  it('minimaler Bruttolohn ergibt minimale Steuer', () => {
    const r = calcQuellensteuer({ ...base, bruttolohn: 1 });
    expect(r.quellensteuerBetrag).toBeGreaterThanOrEqual(0);
    expect(r.quellensteuerBetrag).toBeLessThan(5);
  });

  // 24. 3 Kinder reduzieren mehr als 1 Kind
  it('3 Kinder reduzieren mehr als 1 Kind', () => {
    const r1 = calcQuellensteuer({ ...base, tarif: 'A1' });
    const r3 = calcQuellensteuer({ ...base, tarif: 'A3' });
    expect(r3.quellensteuerBetrag).toBeLessThan(r1.quellensteuerBetrag);
  });

  // 25. Katholisch und reformiert gleicher Zuschlag
  it('reformiert und katholisch gleicher Zuschlag', () => {
    const rRef = calcQuellensteuer({ ...base, konfession: 'reformiert' });
    const rKat = calcQuellensteuer({ ...base, konfession: 'katholisch' });
    expect(rRef.quellensteuerBetrag).toBeCloseTo(rKat.quellensteuerBetrag, 0);
  });

  // 26. Bewilligung hat keinen Einfluss auf Grundberechnung
  it('verschiedene Bewilligungen selbes Ergebnis bei Grundberechnung', () => {
    const rB = calcQuellensteuer({ ...base, bewilligung: 'B' });
    const rL = calcQuellensteuer({ ...base, bewilligung: 'L' });
    expect(rB.quellensteuerBetrag).toBe(rL.quellensteuerBetrag);
  });

  // 27. NOV-Pflicht exakt bei 120'000 Grenze
  it('NOV-Pflicht exakt bei Grenze 120000', () => {
    const r = calcQuellensteuer({ ...base, bruttolohn: 10000 }); // 120'000 p.a.
    expect(r.nachtraeglicheVeranlagungPflicht).toBe(true);

    const rUnter = calcQuellensteuer({ ...base, bruttolohn: 9999 }); // 119'988 p.a.
    expect(rUnter.nachtraeglicheVeranlagungPflicht).toBe(false);
  });

  // 28. NOV-Empfehlung nicht bei hohem Einkommen (ueber NOV-Grenze)
  it('keine NOV-Empfehlung bei hohem Einkommen', () => {
    const r = calcQuellensteuer({ ...base, bruttolohn: 15000 }); // 180'000 p.a.
    expect(r.empfehlungNovAntrag).toBe(false);
    expect(r.nachtraeglicheVeranlagungPflicht).toBe(true);
  });

  // 29. Steuersatz steigt mit Einkommen (Progression)
  it('Steuersatz steigt mit Einkommen', () => {
    const r50k = calcQuellensteuer({ ...base, bruttolohn: 4167 }); // ~50k p.a.
    const r100k = calcQuellensteuer({ ...base, bruttolohn: 8333 }); // ~100k p.a.
    expect(r100k.effektiverSteuersatz).toBeGreaterThan(r50k.effektiverSteuersatz);
  });

  // 30. Tarif-Beschreibung mit 3 Kindern
  it('Tarif-Beschreibung mit 3 Kindern', () => {
    expect(getTarifBeschreibung('B3', 'de')).toContain('3 Kinder');
    expect(getTarifBeschreibung('B3', 'en')).toContain('3 children');
  });
});
