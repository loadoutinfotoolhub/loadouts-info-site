import { z } from 'zod';

export const KANTONE = ['ZH', 'BE', 'VD', 'GE', 'AG', 'ZG', 'BS'] as const;
export type Kanton = (typeof KANTONE)[number];

export const KapitalbezugssteuerInputSchema = z.object({
  bezugsbetrag: z.number().min(0).max(50_000_000),
  kanton: z.enum(KANTONE),
  zivilstand: z.enum(['ledig', 'verheiratet']),
});

export type KapitalbezugssteuerInput = z.infer<typeof KapitalbezugssteuerInputSchema>;

export interface KapitalbezugssteuerOutput {
  steuerBetrag: number;
  effektiverSatz: number;
  nettoAuszahlung: number;
  steuerBund: number;
  steuerKantonGemeinde: number;
}

/**
 * Kapitalbezugssteuer-Saetze bei Bezug von Vorsorgekapital (Saeule 3a, PK).
 * Bund: progressiver Tarif (ca. 1/5 des ordentlichen Tarifs).
 * Kanton/Gemeinde: unterschiedlich, meist ebenfalls progressiv.
 *
 * Vereinfachte Modelle basierend auf kantonalen Steuerdaten.
 * Stuetzpunkte: [Bezugsbetrag, effektiver Gesamtsatz inkl. Bund+Kanton+Gemeinde]
 *
 * Quelle: Vereinfachte Ableitung aus ESTV Kapitalbezugssteuer-Tabellen.
 */
const BEZUGSSTEUER_KURVEN: Record<Kanton, [number, number][]> = {
  ZH: [[0, 0], [50000, 0.035], [100000, 0.05], [200000, 0.065], [500000, 0.08], [1000000, 0.095], [2000000, 0.11]],
  BE: [[0, 0], [50000, 0.04], [100000, 0.055], [200000, 0.07], [500000, 0.09], [1000000, 0.105], [2000000, 0.12]],
  VD: [[0, 0], [50000, 0.06], [100000, 0.075], [200000, 0.09], [500000, 0.11], [1000000, 0.13], [2000000, 0.15]],
  GE: [[0, 0], [50000, 0.055], [100000, 0.07], [200000, 0.085], [500000, 0.10], [1000000, 0.12], [2000000, 0.14]],
  AG: [[0, 0], [50000, 0.04], [100000, 0.055], [200000, 0.07], [500000, 0.085], [1000000, 0.10], [2000000, 0.115]],
  ZG: [[0, 0], [50000, 0.02], [100000, 0.03], [200000, 0.04], [500000, 0.05], [1000000, 0.06], [2000000, 0.07]],
  BS: [[0, 0], [50000, 0.045], [100000, 0.06], [200000, 0.075], [500000, 0.09], [1000000, 0.105], [2000000, 0.12]],
};

const VERHEIRATET_REDUKTION = 0.85;
const BUND_ANTEIL = 0.25;

function interpolateRate(curve: [number, number][], amount: number): number {
  if (amount <= 0) return 0;
  if (amount >= curve[curve.length - 1][0]) return curve[curve.length - 1][1];

  for (let i = 1; i < curve.length; i++) {
    if (amount <= curve[i][0]) {
      const [x0, y0] = curve[i - 1];
      const [x1, y1] = curve[i];
      const t = (amount - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return curve[curve.length - 1][1];
}

/**
 * Berechnet die Kapitalbezugssteuer bei Bezug von Vorsorgekapital.
 *
 * Betrifft: Saeule 3a Bezug, PK-Kapitalbezug, Freizuegigkeitskonto.
 * Besteuert getrennt vom uebrigen Einkommen, zu reduziertem Satz.
 * Tipp: Gestaffelter Bezug ueber mehrere Jahre senkt die Progression.
 */
export function calcKapitalbezugssteuer(input: KapitalbezugssteuerInput): KapitalbezugssteuerOutput {
  const parsed = KapitalbezugssteuerInputSchema.parse(input);
  const { bezugsbetrag, kanton, zivilstand } = parsed;

  let gesamtSatz = interpolateRate(BEZUGSSTEUER_KURVEN[kanton], bezugsbetrag);

  if (zivilstand === 'verheiratet') {
    gesamtSatz *= VERHEIRATET_REDUKTION;
  }

  const effektiverSatz = Math.round(gesamtSatz * 10000) / 100;
  const steuerBetrag = Math.round(bezugsbetrag * gesamtSatz * 100) / 100;
  const steuerBund = Math.round(steuerBetrag * BUND_ANTEIL * 100) / 100;
  const steuerKantonGemeinde = Math.round((steuerBetrag - steuerBund) * 100) / 100;
  const nettoAuszahlung = Math.round((bezugsbetrag - steuerBetrag) * 100) / 100;

  return {
    steuerBetrag,
    effektiverSatz,
    nettoAuszahlung,
    steuerBund,
    steuerKantonGemeinde,
  };
}
