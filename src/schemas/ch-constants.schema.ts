import { z } from 'zod';

const sourceSchema = z.object({
  url: z.string().url(),
  retrieved: z.string().date(),
});

export const chConstantsSchema = z.object({
  version: z.string(),
  effectiveFrom: z.string().date(),
  sources: z.record(z.string(), sourceSchema),

  saeule3a: z.object({
    maxMitPK: z.number().positive(),
    maxOhnePK: z.number().positive(),
    maxProzentOhnePK: z.number().min(0).max(1),
  }),

  sozialversicherung: z.object({
    ahv: z.number().min(0).max(1),
    iv: z.number().min(0).max(1),
    eo: z.number().min(0).max(1),
    alv: z.number().min(0).max(1),
    alvMaxEinkommen: z.number().positive(),
  }),

  bvg: z.object({
    eintrittsschwelle: z.number().positive(),
    koordinationsabzug: z.number().positive(),
    maxVersLohn: z.number().positive(),
    umwandlungssatz: z.number().min(0).max(1),
    beitragssaetze: z.object({
      '25_34': z.number().min(0).max(1),
      '35_44': z.number().min(0).max(1),
      '45_54': z.number().min(0).max(1),
      '55_65': z.number().min(0).max(1),
    }),
  }),

  ahvRenten: z.object({
    maxEinzelMonat: z.number().positive(),
    minEinzelMonat: z.number().positive(),
    maxEhepaarMonat: z.number().positive(),
  }),

  hypothek: z.object({
    kalkZins: z.number().min(0).max(1),
    tragbarkeitMax: z.number().min(0).max(1),
    eigenkapitalMin: z.number().min(0).max(1),
    eigenkapitalHartMin: z.number().min(0).max(1),
    amortisationJahre: z.number().positive().int(),
  }),

  mwst: z.object({
    normal: z.number().min(0).max(1),
    reduziert: z.number().min(0).max(1),
    beherbergung: z.number().min(0).max(1),
  }),
});

export type ChConstants = z.infer<typeof chConstantsSchema>;
