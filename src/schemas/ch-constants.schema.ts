import { z } from 'zod';

/**
 * Per-value source metadata for Source-Guardian verification.
 * Each SSOT value carries its own verification info: URL, regex, expected match, legal basis.
 */
const valueSourceSchema = z.object({
  url: z.string().url(),
  retrieved: z.string().date(),
  regex: z.string(),
  expected: z.string(),
  legalBasis: z.string().optional(),
  displayName: z.string(),
});

/** A numeric value with full source provenance. */
const sourcedNumber = z.object({
  value: z.number(),
  source: valueSourceSchema,
});

/** Top-level source index (kept for general reference). */
const topLevelSourceSchema = z.object({
  url: z.string().url(),
  retrieved: z.string().date(),
});

export const chConstantsSchema = z.object({
  version: z.string(),
  effectiveFrom: z.string().date(),
  sources: z.record(z.string(), topLevelSourceSchema),

  saeule3a: z.object({
    maxMitPK: sourcedNumber,
    maxOhnePK: sourcedNumber,
    maxProzentOhnePK: sourcedNumber,
  }),

  sozialversicherung: z.object({
    ahv: sourcedNumber,
    iv: sourcedNumber,
    eo: sourcedNumber,
    alv: sourcedNumber,
    alvMaxEinkommen: sourcedNumber,
  }),

  bvg: z.object({
    eintrittsschwelle: sourcedNumber,
    koordinationsabzug: sourcedNumber,
    maxVersLohn: sourcedNumber,
    umwandlungssatz: sourcedNumber,
    beitragssaetze: z.object({
      '25_34': sourcedNumber,
      '35_44': sourcedNumber,
      '45_54': sourcedNumber,
      '55_65': sourcedNumber,
    }),
  }),

  ahvRenten: z.object({
    maxEinzelMonat: sourcedNumber,
    minEinzelMonat: sourcedNumber,
    maxEhepaarMonat: sourcedNumber,
  }),

  hypothek: z.object({
    kalkZins: sourcedNumber,
    tragbarkeitMax: sourcedNumber,
    eigenkapitalMin: sourcedNumber,
    eigenkapitalHartMin: sourcedNumber,
    amortisationJahre: sourcedNumber,
  }),

  mwst: z.object({
    normal: sourcedNumber,
    reduziert: sourcedNumber,
    beherbergung: sourcedNumber,
  }),
});

export type ChConstants = z.infer<typeof chConstantsSchema>;

export type ValueSource = z.infer<typeof valueSourceSchema>;

export type SourcedNumber = z.infer<typeof sourcedNumber>;

/**
 * Flat version of ChConstants where sourced numbers are replaced with plain numbers.
 * Used by calculators: CH2026.saeule3a.maxMitPK -> 7258
 */
export interface ChConstantsFlat {
  version: string;
  effectiveFrom: string;
  sources: Record<string, { url: string; retrieved: string }>;
  saeule3a: { maxMitPK: number; maxOhnePK: number; maxProzentOhnePK: number };
  sozialversicherung: { ahv: number; iv: number; eo: number; alv: number; alvMaxEinkommen: number };
  bvg: {
    eintrittsschwelle: number;
    koordinationsabzug: number;
    maxVersLohn: number;
    umwandlungssatz: number;
    beitragssaetze: { '25_34': number; '35_44': number; '45_54': number; '55_65': number };
  };
  ahvRenten: { maxEinzelMonat: number; minEinzelMonat: number; maxEhepaarMonat: number };
  hypothek: {
    kalkZins: number;
    tragbarkeitMax: number;
    eigenkapitalMin: number;
    eigenkapitalHartMin: number;
    amortisationJahre: number;
  };
  mwst: { normal: number; reduziert: number; beherbergung: number };
}
