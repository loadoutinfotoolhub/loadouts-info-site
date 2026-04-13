import { CH2026 } from '../ch-constants';
import { z } from 'zod';

export const TragbarkeitInputSchema = z.object({
  immobilienwert: z.number().min(0).max(50_000_000),
  bruttoeinkommen: z.number().min(0).max(10_000_000),
  eigenkapital: z.number().min(0).max(50_000_000),
});

export type TragbarkeitInput = z.infer<typeof TragbarkeitInputSchema>;

export interface TragbarkeitOutput {
  hypothek: number;
  belehnung: number;
  eigenkapitalQuote: number;
  eigenkapitalMin: number;
  fehlendesEigenkapital: number;
  kalkZins: number;
  kalkZinsKosten: number;
  nebenkostenPauschale: number;
  amortisation: number;
  jaehrlicheWohnkosten: number;
  monatlicheWohnkosten: number;
  tragbarkeitRatio: number;
  tragbar: boolean;
  benoetigtesEinkommen: number;
}

/**
 * Berechnet Hypothek-Tragbarkeit nach Schweizer Bankstandard.
 *
 * Kalkulatorischer Zins: 5% (FINMA/SBVg).
 * Max Tragbarkeit: 33% des Bruttoeinkommens.
 * Min Eigenkapital: 20% (davon 10% hart).
 * Amortisation: 2. Hypothek in 15 Jahren auf 66%.
 * Nebenkosten-Pauschale: 1% des Immobilienwerts p.a.
 *
 * @see FINMA / Schweizerische Bankiervereinigung Richtlinien
 */
export function calcTragbarkeit(input: TragbarkeitInput): TragbarkeitOutput {
  const parsed = TragbarkeitInputSchema.parse(input);

  const eigenkapitalMin = parsed.immobilienwert * CH2026.hypothek.eigenkapitalMin;
  const effektivesEK = Math.min(parsed.eigenkapital, parsed.immobilienwert);
  const fehlendesEigenkapital = Math.max(0, eigenkapitalMin - effektivesEK);

  const hypothek = Math.max(0, parsed.immobilienwert - effektivesEK);
  const belehnung = parsed.immobilienwert > 0 ? hypothek / parsed.immobilienwert : 0;
  const eigenkapitalQuote = parsed.immobilienwert > 0 ? effektivesEK / parsed.immobilienwert : 0;

  // Kosten-Berechnung mit kalkulatorischem Zins
  const kalkZins = CH2026.hypothek.kalkZins;
  const kalkZinsKosten = hypothek * kalkZins;
  const nebenkostenPauschale = parsed.immobilienwert * 0.01;

  // Amortisation: 2. Hypothek (über 66%) in 15 Jahren
  const erstHypothekGrenze = parsed.immobilienwert * 0.66;
  const zweitHypothek = Math.max(0, hypothek - erstHypothekGrenze);
  const amortisation = zweitHypothek > 0
    ? zweitHypothek / CH2026.hypothek.amortisationJahre
    : 0;

  const jaehrlicheWohnkosten = kalkZinsKosten + nebenkostenPauschale + amortisation;
  const monatlicheWohnkosten = jaehrlicheWohnkosten / 12;

  const tragbarkeitRatio = parsed.bruttoeinkommen > 0
    ? jaehrlicheWohnkosten / parsed.bruttoeinkommen
    : jaehrlicheWohnkosten > 0 ? 1 : 0;

  const tragbar = tragbarkeitRatio <= CH2026.hypothek.tragbarkeitMax;

  // Benötigtes Einkommen: Wohnkosten / 33%
  const benoetigtesEinkommen = jaehrlicheWohnkosten / CH2026.hypothek.tragbarkeitMax;

  return {
    hypothek: Math.round(hypothek),
    belehnung: Math.round(belehnung * 1000) / 10,
    eigenkapitalQuote: Math.round(eigenkapitalQuote * 1000) / 10,
    eigenkapitalMin: Math.round(eigenkapitalMin),
    fehlendesEigenkapital: Math.round(fehlendesEigenkapital),
    kalkZins: kalkZins * 100,
    kalkZinsKosten: Math.round(kalkZinsKosten),
    nebenkostenPauschale: Math.round(nebenkostenPauschale),
    amortisation: Math.round(amortisation),
    jaehrlicheWohnkosten: Math.round(jaehrlicheWohnkosten),
    monatlicheWohnkosten: Math.round(monatlicheWohnkosten),
    tragbarkeitRatio: Math.round(tragbarkeitRatio * 1000) / 10,
    tragbar,
    benoetigtesEinkommen: Math.round(benoetigtesEinkommen),
  };
}
