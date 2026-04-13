import { CH2026 } from '../ch-constants';
import { z } from 'zod';

export const KANTONE = ['ZH', 'BE', 'VD', 'GE', 'AG', 'ZG', 'BS'] as const;
export type Kanton = (typeof KANTONE)[number];

export const TARIFE = ['A0', 'A1', 'A2', 'A3', 'B0', 'B1', 'B2', 'B3', 'C0', 'C1', 'C2', 'C3', 'H1', 'H2', 'H3'] as const;
export type Tarif = (typeof TARIFE)[number];

export const BEWILLIGUNGEN = ['B', 'L', 'G', 'F', 'N'] as const;
export type Bewilligung = (typeof BEWILLIGUNGEN)[number];

export const KONFESSIONEN = ['keine', 'reformiert', 'katholisch'] as const;
export type Konfession = (typeof KONFESSIONEN)[number];

export const QuellensteuerInputSchema = z.object({
  bruttolohn: z.number().min(0).max(10_000_000),
  kanton: z.enum(KANTONE),
  tarif: z.enum(TARIFE),
  konfession: z.enum(KONFESSIONEN),
  bewilligung: z.enum(BEWILLIGUNGEN),
  kinderAnzahl: z.number().int().min(0).max(10),
});

export type QuellensteuerInput = z.infer<typeof QuellensteuerInputSchema>;

export interface QuellensteuerOutput {
  jahresbrutto: number;
  quellensteuerBetrag: number;
  effektiverSteuersatz: number;
  quellensteuerMonat: number;
  nachtraeglicheVeranlagungPflicht: boolean;
  empfehlungNovAntrag: boolean;
  tarifBeschreibung: string;
}

/**
 * Quellensteuer-Effektivsaetze nach Tarif und Kanton.
 * Stuetzpunkte [Jahresbrutto, Effektivsatz].
 * Vereinfachte Modelle basierend auf kantonalen Quellensteuer-Tarifen 2026.
 *
 * Tarif-Logik:
 * A = Alleinstehend (Ziffer = Kinderanzahl)
 * B = Verheiratet, Alleinverdiener (Ziffer = Kinderanzahl)
 * C = Verheiratet, Doppelverdiener (Ziffer = Kinderanzahl)
 * H = Alleinerziehend (Ziffer = Kinderanzahl)
 *
 * Quelle: Vereinfachte Ableitung aus kantonalen Quellensteuer-Tarifen.
 * Hinweis: Dies ist eine Schaetzung. Offizielle Tarife bei kantonalen
 * Steueraemtern abrufbar.
 */

/** Basiskurven fuer Tarif A0 (Alleinstehend, keine Kinder) pro Kanton */
const QST_A0: Record<Kanton, [number, number][]> = {
  ZH: [[0, 0], [20000, 0.04], [40000, 0.08], [60000, 0.12], [80000, 0.15], [100000, 0.17], [120000, 0.19], [150000, 0.21], [200000, 0.24], [500000, 0.29]],
  BE: [[0, 0], [20000, 0.05], [40000, 0.10], [60000, 0.14], [80000, 0.17], [100000, 0.20], [120000, 0.22], [150000, 0.25], [200000, 0.28], [500000, 0.33]],
  VD: [[0, 0], [20000, 0.06], [40000, 0.12], [60000, 0.16], [80000, 0.20], [100000, 0.23], [120000, 0.25], [150000, 0.28], [200000, 0.31], [500000, 0.36]],
  GE: [[0, 0], [20000, 0.06], [40000, 0.12], [60000, 0.17], [80000, 0.21], [100000, 0.24], [120000, 0.27], [150000, 0.30], [200000, 0.33], [500000, 0.38]],
  AG: [[0, 0], [20000, 0.04], [40000, 0.08], [60000, 0.11], [80000, 0.14], [100000, 0.16], [120000, 0.18], [150000, 0.20], [200000, 0.23], [500000, 0.27]],
  ZG: [[0, 0], [20000, 0.02], [40000, 0.04], [60000, 0.06], [80000, 0.08], [100000, 0.10], [120000, 0.12], [150000, 0.14], [200000, 0.16], [500000, 0.20]],
  BS: [[0, 0], [20000, 0.05], [40000, 0.10], [60000, 0.14], [80000, 0.17], [100000, 0.20], [120000, 0.22], [150000, 0.25], [200000, 0.28], [500000, 0.33]],
};

/**
 * Tarif-Faktoren relativ zu A0:
 * B: Verheiratet-Splitting senkt den Satz
 * C: Doppelverdiener-Effekt, hoeher als B
 * H: Alleinerziehend, tiefer als A
 * Kinderabzuege reduzieren den Satz weiter
 */
const TARIF_FAKTOREN: Record<string, number> = {
  A: 1.0,
  B: 0.75,
  C: 0.90,
  H: 0.85,
};

const KIND_REDUKTION_PRO_KIND = 0.03;

/** Kirchensteuer-Zuschlag als Anteil der Quellensteuer */
const KONFESSIONS_ZUSCHLAG: Record<Konfession, number> = {
  keine: 0,
  reformiert: 0.04,
  katholisch: 0.04,
};

/** Grenze fuer nachtraegliche ordentliche Veranlagung */
const NOV_GRENZE = 120000;

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

function parseTarif(tarif: Tarif): { letter: string; kinder: number } {
  const letter = tarif.charAt(0);
  const kinder = parseInt(tarif.charAt(1), 10);
  return { letter, kinder };
}

function getTarifBeschreibung(tarif: Tarif, lang: 'de' | 'en' = 'de'): string {
  const { letter, kinder } = parseTarif(tarif);
  const kinderText = kinder === 0
    ? (lang === 'de' ? 'keine Kinder' : 'no children')
    : (lang === 'de' ? `${kinder} Kind${kinder > 1 ? 'er' : ''}` : `${kinder} child${kinder > 1 ? 'ren' : ''}`);

  const tarifNames: Record<string, Record<string, string>> = {
    de: { A: 'Alleinstehend', B: 'Verheiratet, Alleinverdiener', C: 'Verheiratet, Doppelverdiener', H: 'Alleinerziehend' },
    en: { A: 'Single', B: 'Married, sole earner', C: 'Married, dual income', H: 'Single parent' },
  };

  return `${tarifNames[lang][letter]}, ${kinderText}`;
}

/**
 * Berechnet die Quellensteuer fuer auslaendische Arbeitnehmer in der Schweiz.
 *
 * Die Quellensteuer wird direkt vom Lohn abgezogen und ersetzt die
 * ordentliche Einkommenssteuer. Sie umfasst Bundes-, Kantons- und
 * Gemeindesteuer in einem Satz.
 *
 * Ab CHF 120'000 Jahresbrutto: Pflicht zur nachtraeglichen ordentlichen
 * Veranlagung (NOV), unabhaengig von Bewilligung.
 *
 * Grenzgaenger (Bewilligung G): Spezielle Regelungen je nach Herkunftsland.
 * DE/AT: Quellensteuer max 4.5% (Doppelbesteuerungsabkommen).
 * FR: Quellensteuer in der Schweiz (ausser GE, wo FR besteuert).
 * IT: Quellensteuer in der Schweiz fuer bestimmte Kantone.
 */
export function calcQuellensteuer(input: QuellensteuerInput): QuellensteuerOutput {
  const parsed = QuellensteuerInputSchema.parse(input);
  const jahresbrutto = parsed.bruttolohn * 12;

  const { letter, kinder } = parseTarif(parsed.tarif);

  // Basiskurve vom Kanton holen (A0)
  const basiskurve = QST_A0[parsed.kanton];
  let basisRate = interpolateRate(basiskurve, jahresbrutto);

  // Tarif-Faktor anwenden
  const tarifFaktor = TARIF_FAKTOREN[letter] ?? 1.0;
  basisRate *= tarifFaktor;

  // Kinderabzug
  basisRate = Math.max(0, basisRate - kinder * KIND_REDUKTION_PRO_KIND);

  // Konfessionszuschlag
  basisRate += KONFESSIONS_ZUSCHLAG[parsed.konfession];

  // Effektiver Steuersatz (auf 2 Dezimalstellen)
  const effektiverSteuersatz = Math.round(basisRate * 10000) / 100;

  // Quellensteuer-Betrag
  const quellensteuerBetrag = Math.round(jahresbrutto * basisRate * 100) / 100;
  const quellensteuerMonat = Math.round(quellensteuerBetrag / 12 * 100) / 100;

  // NOV-Pflicht ab CHF 120'000
  const nachtraeglicheVeranlagungPflicht = jahresbrutto >= NOV_GRENZE;

  // Empfehlung NOV-Antrag: sinnvoll wenn hohe Abzuege moeglich
  // (z.B. Saeule 3a, Berufsauslagen, Schuldzinsen)
  const empfehlungNovAntrag = jahresbrutto >= 80000 && jahresbrutto < NOV_GRENZE;

  return {
    jahresbrutto,
    quellensteuerBetrag,
    effektiverSteuersatz,
    quellensteuerMonat,
    nachtraeglicheVeranlagungPflicht,
    empfehlungNovAntrag,
    tarifBeschreibung: getTarifBeschreibung(parsed.tarif),
  };
}

export { getTarifBeschreibung };
