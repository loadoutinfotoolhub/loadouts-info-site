import { describe, it, expect } from 'vitest';
import { calcProzent, type ProzentrechnerInput } from './prozentrechner';

describe('Prozentrechner', () => {
  // prozentVon: Was sind X% von Y?
  it('20% von 500 = 100', () => {
    const r = calcProzent({ modus: 'prozentVon', wert1: 20, wert2: 500 });
    expect(r.ergebnis).toBe(100);
  });

  it('8.1% von 1000 = 81', () => {
    const r = calcProzent({ modus: 'prozentVon', wert1: 8.1, wert2: 1000 });
    expect(r.ergebnis).toBe(81);
  });

  it('0% von 500 = 0', () => {
    const r = calcProzent({ modus: 'prozentVon', wert1: 0, wert2: 500 });
    expect(r.ergebnis).toBe(0);
  });

  it('100% von 250 = 250', () => {
    const r = calcProzent({ modus: 'prozentVon', wert1: 100, wert2: 250 });
    expect(r.ergebnis).toBe(250);
  });

  // prozentAnteil: X ist wieviel % von Y?
  it('100 ist 20% von 500', () => {
    const r = calcProzent({ modus: 'prozentAnteil', wert1: 100, wert2: 500 });
    expect(r.ergebnis).toBe(20);
  });

  it('250 ist 50% von 500', () => {
    const r = calcProzent({ modus: 'prozentAnteil', wert1: 250, wert2: 500 });
    expect(r.ergebnis).toBe(50);
  });

  it('Division durch 0 ergibt 0', () => {
    const r = calcProzent({ modus: 'prozentAnteil', wert1: 100, wert2: 0 });
    expect(r.ergebnis).toBe(0);
  });

  // prozentAenderung: Von X zu Y = wieviel %?
  it('100 -> 120 = +20%', () => {
    const r = calcProzent({ modus: 'prozentAenderung', wert1: 100, wert2: 120 });
    expect(r.ergebnis).toBe(20);
  });

  it('100 -> 80 = -20%', () => {
    const r = calcProzent({ modus: 'prozentAenderung', wert1: 100, wert2: 80 });
    expect(r.ergebnis).toBe(-20);
  });

  it('Aenderung von 0 ergibt 0', () => {
    const r = calcProzent({ modus: 'prozentAenderung', wert1: 0, wert2: 100 });
    expect(r.ergebnis).toBe(0);
  });

  it('keine Aenderung = 0%', () => {
    const r = calcProzent({ modus: 'prozentAenderung', wert1: 100, wert2: 100 });
    expect(r.ergebnis).toBe(0);
  });

  it('Beschreibung enthaelt Ergebnis', () => {
    const r = calcProzent({ modus: 'prozentVon', wert1: 25, wert2: 200 });
    expect(r.beschreibung).toContain('50');
  });
});
