import { z } from 'zod';

export const MODI = ['prozentVon', 'prozentAnteil', 'prozentAenderung'] as const;
export type Modus = (typeof MODI)[number];

export const ProzentrechnerInputSchema = z.object({
  modus: z.enum(MODI),
  wert1: z.number(),
  wert2: z.number(),
});

export type ProzentrechnerInput = z.infer<typeof ProzentrechnerInputSchema>;

export interface ProzentrechnerOutput {
  ergebnis: number;
  beschreibung: string;
}

/**
 * Universaler Prozentrechner mit 3 Modi:
 *
 * 1. prozentVon: Was sind X% von Y? (z.B. 20% von 500 = 100)
 * 2. prozentAnteil: X ist wieviel % von Y? (z.B. 100 ist 20% von 500)
 * 3. prozentAenderung: Um wieviel % aendert sich X zu Y? (z.B. 100 -> 120 = +20%)
 */
export function calcProzent(input: ProzentrechnerInput): ProzentrechnerOutput {
  const parsed = ProzentrechnerInputSchema.parse(input);
  const { modus, wert1, wert2 } = parsed;

  let ergebnis: number;
  let beschreibung: string;

  switch (modus) {
    case 'prozentVon':
      ergebnis = Math.round(wert1 / 100 * wert2 * 100) / 100;
      beschreibung = `${wert1}% von ${wert2} = ${ergebnis}`;
      break;

    case 'prozentAnteil':
      if (wert2 === 0) {
        ergebnis = 0;
        beschreibung = 'Division durch 0 nicht moeglich';
      } else {
        ergebnis = Math.round(wert1 / wert2 * 10000) / 100;
        beschreibung = `${wert1} ist ${ergebnis}% von ${wert2}`;
      }
      break;

    case 'prozentAenderung':
      if (wert1 === 0) {
        ergebnis = 0;
        beschreibung = 'Aenderung von 0 nicht berechenbar';
      } else {
        ergebnis = Math.round((wert2 - wert1) / wert1 * 10000) / 100;
        beschreibung = `Von ${wert1} zu ${wert2} = ${ergebnis >= 0 ? '+' : ''}${ergebnis}%`;
      }
      break;
  }

  return { ergebnis, beschreibung };
}
