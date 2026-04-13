import { z } from 'zod';

export const ZinseszinsInputSchema = z.object({
  startkapital: z.number().min(0).max(100_000_000),
  monatlicheEinzahlung: z.number().min(0).max(1_000_000),
  zinssatz: z.number().min(0).max(100),
  laufzeit: z.number().int().min(1).max(100),
});

export type ZinseszinsInput = z.infer<typeof ZinseszinsInputSchema>;

export interface ZinseszinsOutput {
  endkapital: number;
  totalEinzahlungen: number;
  totalZinsen: number;
  zinsenAnteil: number;
  jahreDaten: { jahr: number; kapital: number; einzahlungen: number; zinsen: number }[];
}

/**
 * Berechnet Zinseszins mit optionalen monatlichen Einzahlungen.
 * Formel: Endkapital = Startkapital * (1 + r)^n + Einzahlung * ((1 + r)^n - 1) / r
 * wobei r = jaehrlicher Zinssatz / 12, n = Monate.
 */
export function calcZinseszins(input: ZinseszinsInput): ZinseszinsOutput {
  const parsed = ZinseszinsInputSchema.parse(input);
  const { startkapital, monatlicheEinzahlung, zinssatz, laufzeit } = parsed;

  const monthlyRate = zinssatz / 100 / 12;
  const jahreDaten: ZinseszinsOutput['jahreDaten'] = [];

  let kapital = startkapital;
  let totalEinzahlungen = startkapital;

  for (let jahr = 1; jahr <= laufzeit; jahr++) {
    for (let monat = 0; monat < 12; monat++) {
      kapital += monatlicheEinzahlung;
      totalEinzahlungen += monatlicheEinzahlung;
      if (monthlyRate > 0) {
        kapital *= (1 + monthlyRate);
      }
    }

    jahreDaten.push({
      jahr,
      kapital: Math.round(kapital * 100) / 100,
      einzahlungen: Math.round(totalEinzahlungen * 100) / 100,
      zinsen: Math.round((kapital - totalEinzahlungen) * 100) / 100,
    });
  }

  const endkapital = Math.round(kapital * 100) / 100;
  totalEinzahlungen = Math.round(totalEinzahlungen * 100) / 100;
  const totalZinsen = Math.round((endkapital - totalEinzahlungen) * 100) / 100;
  const zinsenAnteil = endkapital > 0 ? Math.round(totalZinsen / endkapital * 10000) / 100 : 0;

  return { endkapital, totalEinzahlungen, totalZinsen, zinsenAnteil, jahreDaten };
}
