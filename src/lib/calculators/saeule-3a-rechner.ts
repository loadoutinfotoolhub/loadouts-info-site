import { CH2026 } from '../ch-constants';
import { z } from 'zod';

export const Saeule3aInputSchema = z.object({
  hasPensionskasse: z.boolean(),
  nettoeinkommen: z.number().min(0).optional(),
  einzahlung: z.number().min(0),
  grenzSteuersatz: z.number().min(0).max(0.5),
});

export type Saeule3aInput = z.infer<typeof Saeule3aInputSchema>;

export interface Saeule3aOutput {
  maxErlaubt: number;
  effektiveEinzahlung: number;
  ueberEinzahlung: number;
  steuerersparnis: number;
}

/**
 * Berechnet Saeule 3a Einzahlungs-Check und Steuerersparnis.
 *
 * Mit PK: max CHF 7'258 (2026), unabhaengig vom Einkommen.
 * Ohne PK: max 20% des Nettoerwerbseinkommens, max CHF 36'288.
 *
 * @see BSV Art. 7 BVV 3
 * @see https://www.bsv.admin.ch/de/beitrag-3-sauele
 */
export function calcSaeule3a(input: Saeule3aInput): Saeule3aOutput {
  const parsed = Saeule3aInputSchema.parse(input);

  const maxErlaubt = parsed.hasPensionskasse
    ? CH2026.saeule3a.maxMitPK
    : Math.min(
        (parsed.nettoeinkommen ?? 0) * CH2026.saeule3a.maxProzentOhnePK,
        CH2026.saeule3a.maxOhnePK,
      );

  const effektiveEinzahlung = Math.min(parsed.einzahlung, maxErlaubt);
  const ueberEinzahlung = Math.max(0, parsed.einzahlung - maxErlaubt);
  const steuerersparnis = effektiveEinzahlung * parsed.grenzSteuersatz;

  return { maxErlaubt, effektiveEinzahlung, ueberEinzahlung, steuerersparnis };
}
