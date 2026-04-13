import { CH2026 } from '../ch-constants';
import { z } from 'zod';

export const MWST_SAETZE = ['normal', 'reduziert', 'beherbergung'] as const;
export type MwstSatz = (typeof MWST_SAETZE)[number];

export const MwstInputSchema = z.object({
  betrag: z.number().min(0).max(100_000_000),
  satz: z.enum(MWST_SAETZE),
  richtung: z.enum(['inkl', 'exkl']),
});

export type MwstInput = z.infer<typeof MwstInputSchema>;

export interface MwstOutput {
  betragInkl: number;
  betragExkl: number;
  mwstBetrag: number;
  mwstSatz: number;
  satzBezeichnung: string;
}

const SATZ_BEZEICHNUNGEN: Record<MwstSatz, Record<string, string>> = {
  normal: { de: 'Normalsatz', en: 'Standard rate' },
  reduziert: { de: 'Reduzierter Satz', en: 'Reduced rate' },
  beherbergung: { de: 'Sondersatz Beherbergung', en: 'Special accommodation rate' },
};

function getSatzValue(satz: MwstSatz): number {
  return CH2026.mwst[satz];
}

/**
 * MwSt-Rechner: Berechnet Schweizer Mehrwertsteuer.
 * 3 Saetze: Normal (8.1%), Reduziert (2.6%), Beherbergung (3.8%).
 * Richtung: inkl -> exkl oder exkl -> inkl.
 */
export function calcMwst(input: MwstInput): MwstOutput {
  const parsed = MwstInputSchema.parse(input);
  const rate = getSatzValue(parsed.satz);
  const mwstSatz = Math.round(rate * 1000) / 10;

  let betragInkl: number;
  let betragExkl: number;
  let mwstBetrag: number;

  if (parsed.richtung === 'exkl') {
    betragExkl = parsed.betrag;
    mwstBetrag = betragExkl * rate;
    betragInkl = betragExkl + mwstBetrag;
  } else {
    betragInkl = parsed.betrag;
    betragExkl = betragInkl / (1 + rate);
    mwstBetrag = betragInkl - betragExkl;
  }

  return {
    betragInkl: Math.round(betragInkl * 100) / 100,
    betragExkl: Math.round(betragExkl * 100) / 100,
    mwstBetrag: Math.round(mwstBetrag * 100) / 100,
    mwstSatz,
    satzBezeichnung: SATZ_BEZEICHNUNGEN[parsed.satz].de,
  };
}

export { SATZ_BEZEICHNUNGEN };
