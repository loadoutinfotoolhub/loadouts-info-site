import { CH2026 } from '../ch-constants';
import { z } from 'zod';

export const KANTONE = ['ZH', 'BE', 'VD', 'GE', 'AG', 'ZG', 'BS'] as const;
export type Kanton = (typeof KANTONE)[number];

export const LohnrechnerInputSchema = z.object({
  bruttolohn: z.number().min(0).max(10_000_000),
  kanton: z.enum(KANTONE),
  zivilstand: z.enum(['ledig', 'verheiratet']),
  konfession: z.enum(['keine', 'reformiert', 'katholisch']),
  alter: z.number().int().min(18).max(70),
  dreizehnterMonatslohn: z.boolean(),
});

export type LohnrechnerInput = z.infer<typeof LohnrechnerInputSchema>;

export interface LohnrechnerOutput {
  jahresBrutto: number;
  monatsBrutto: number;
  ahv: number;
  iv: number;
  eo: number;
  alv: number;
  bvg: number;
  steuer: number;
  kirchensteuer: number;
  totalAbzuege: number;
  jahresNetto: number;
  monatsNetto: number;
  grenzSteuersatz: number;
}

/**
 * Vereinfachte effektive Steuersätze (Bund + Kanton + Gemeinde)
 * pro Kanton für alleinstehend, ohne Kirchensteuer.
 * Interpoliert linear zwischen den Stützpunkten.
 *
 * Quelle: Vereinfachte Ableitung aus ESTV Steuerbelastungstabellen 2026.
 * Hinweis: Dies ist eine Schätzung, keine exakte Steuerberechnung.
 */
const STEUERKURVEN: Record<Kanton, [number, number][]> = {
  ZH: [[0, 0], [20000, 0.02], [40000, 0.07], [60000, 0.12], [80000, 0.15], [100000, 0.18], [120000, 0.20], [150000, 0.22], [200000, 0.25], [500000, 0.30]],
  BE: [[0, 0], [20000, 0.03], [40000, 0.09], [60000, 0.14], [80000, 0.17], [100000, 0.20], [120000, 0.22], [150000, 0.25], [200000, 0.28], [500000, 0.33]],
  VD: [[0, 0], [20000, 0.04], [40000, 0.10], [60000, 0.15], [80000, 0.19], [100000, 0.22], [120000, 0.24], [150000, 0.27], [200000, 0.30], [500000, 0.35]],
  GE: [[0, 0], [20000, 0.04], [40000, 0.11], [60000, 0.16], [80000, 0.20], [100000, 0.23], [120000, 0.26], [150000, 0.29], [200000, 0.32], [500000, 0.37]],
  AG: [[0, 0], [20000, 0.02], [40000, 0.07], [60000, 0.11], [80000, 0.14], [100000, 0.16], [120000, 0.19], [150000, 0.21], [200000, 0.24], [500000, 0.28]],
  ZG: [[0, 0], [20000, 0.01], [40000, 0.03], [60000, 0.06], [80000, 0.08], [100000, 0.10], [120000, 0.12], [150000, 0.14], [200000, 0.16], [500000, 0.20]],
  BS: [[0, 0], [20000, 0.03], [40000, 0.09], [60000, 0.13], [80000, 0.16], [100000, 0.19], [120000, 0.21], [150000, 0.24], [200000, 0.27], [500000, 0.33]],
};

/** Verheiratete zahlen ca. 10-20% weniger Steuern (Splitting-Effekt). */
const VERHEIRATET_FAKTOR = 0.82;

/** Kirchensteuer als Anteil der Kantons-/Gemeindesteuer. */
const KIRCHENSTEUER_ANTEIL: Record<Kanton, number> = {
  ZH: 0.10, BE: 0.12, VD: 0.10, GE: 0.06, AG: 0.10, ZG: 0.08, BS: 0.08,
};

function interpolateRate(curve: [number, number][], income: number): number {
  if (income <= 0) return 0;
  if (income >= curve[curve.length - 1][0]) return curve[curve.length - 1][1];

  for (let i = 1; i < curve.length; i++) {
    if (income <= curve[i][0]) {
      const [x0, y0] = curve[i - 1];
      const [x1, y1] = curve[i];
      const t = (income - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return curve[curve.length - 1][1];
}

function calcEffectiveTaxRate(income: number, kanton: Kanton, verheiratet: boolean): number {
  let rate = interpolateRate(STEUERKURVEN[kanton], income);
  if (verheiratet) rate *= VERHEIRATET_FAKTOR;
  return rate;
}

function calcMarginalTaxRate(income: number, kanton: Kanton, verheiratet: boolean): number {
  const delta = 1000;
  const tax1 = income * calcEffectiveTaxRate(income, kanton, verheiratet);
  const tax2 = (income + delta) * calcEffectiveTaxRate(income + delta, kanton, verheiratet);
  return Math.max(0, (tax2 - tax1) / delta);
}

function getBvgRate(alter: number): number {
  const saetze = CH2026.bvg.beitragssaetze;
  if (alter < 25) return 0;
  if (alter <= 34) return saetze['25_34'];
  if (alter <= 44) return saetze['35_44'];
  if (alter <= 54) return saetze['45_54'];
  return saetze['55_65'];
}

/**
 * Berechnet Nettolohn aus Bruttolohn für Schweizer Arbeitnehmer.
 *
 * Sozialversicherungsbeiträge: AHV 5.3%, IV 0.7%, EO 0.25%, ALV 1.1%.
 * BVG: altersabhängig auf koordiniertem Lohn (Arbeitnehmeranteil = 50%).
 * Steuern: vereinfachte kantonale Modelle.
 *
 * @see BSV für AHV/IV/EO, SECO für ALV, BVG Kennzahlen
 */
export function calcLohnrechner(input: LohnrechnerInput): LohnrechnerOutput {
  const parsed = LohnrechnerInputSchema.parse(input);

  // Jahresbrutto berechnen
  const faktor = parsed.dreizehnterMonatslohn ? 13 : 12;
  const jahresBrutto = parsed.bruttolohn * faktor;

  // Sozialversicherungsbeiträge (Arbeitnehmeranteil)
  const ahv = jahresBrutto * CH2026.sozialversicherung.ahv;
  const iv = jahresBrutto * CH2026.sozialversicherung.iv;
  const eo = jahresBrutto * CH2026.sozialversicherung.eo;
  const alvBasis = Math.min(jahresBrutto, CH2026.sozialversicherung.alvMaxEinkommen);
  const alv = alvBasis * CH2026.sozialversicherung.alv;

  // BVG (Arbeitnehmeranteil = 50% des Gesamtbeitrags)
  let bvg = 0;
  if (jahresBrutto >= CH2026.bvg.eintrittsschwelle && parsed.alter >= 25) {
    const koordinierterLohn = Math.min(
      Math.max(jahresBrutto - CH2026.bvg.koordinationsabzug, 0),
      CH2026.bvg.maxVersLohn - CH2026.bvg.koordinationsabzug,
    );
    const bvgRate = getBvgRate(parsed.alter);
    bvg = koordinierterLohn * bvgRate * 0.5; // 50% Arbeitnehmeranteil
  }

  // Steuerbares Einkommen (vereinfacht: nach Sozialabzügen)
  const sozialAbzuege = ahv + iv + eo + alv + bvg;
  const steuerEinkommen = Math.max(0, jahresBrutto - sozialAbzuege);

  // Steuer berechnen
  const verheiratet = parsed.zivilstand === 'verheiratet';
  const effectiveRate = calcEffectiveTaxRate(steuerEinkommen, parsed.kanton, verheiratet);
  let steuer = steuerEinkommen * effectiveRate;

  // Kirchensteuer
  let kirchensteuer = 0;
  if (parsed.konfession !== 'keine') {
    kirchensteuer = steuer * KIRCHENSTEUER_ANTEIL[parsed.kanton];
  }

  steuer = Math.round(steuer * 100) / 100;
  kirchensteuer = Math.round(kirchensteuer * 100) / 100;

  const totalAbzuege = Math.round((sozialAbzuege + steuer + kirchensteuer) * 100) / 100;
  const jahresNetto = Math.round((jahresBrutto - totalAbzuege) * 100) / 100;

  const grenzSteuersatz = Math.round(calcMarginalTaxRate(steuerEinkommen, parsed.kanton, verheiratet) * 1000) / 10;

  return {
    jahresBrutto,
    monatsBrutto: parsed.bruttolohn,
    ahv: Math.round(ahv * 100) / 100,
    iv: Math.round(iv * 100) / 100,
    eo: Math.round(eo * 100) / 100,
    alv: Math.round(alv * 100) / 100,
    bvg: Math.round(bvg * 100) / 100,
    steuer,
    kirchensteuer,
    totalAbzuege,
    jahresNetto,
    monatsNetto: Math.round((jahresNetto / faktor) * 100) / 100,
    grenzSteuersatz,
  };
}
