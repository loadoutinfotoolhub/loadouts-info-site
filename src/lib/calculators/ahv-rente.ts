import { CH2026 } from '../ch-constants';
import { z } from 'zod';

export const AhvRenteInputSchema = z.object({
  beitragsjahre: z.number().int().min(1).max(44),
  durchschnittlichesEinkommen: z.number().min(0).max(10_000_000),
  zivilstand: z.enum(['ledig', 'verheiratet']),
});

export type AhvRenteInput = z.infer<typeof AhvRenteInputSchema>;

export interface AhvRenteOutput {
  monatsrente: number;
  jahresrente: number;
  rentenSkala: number;
  plafoniert: boolean;
  maxRente: number;
  minRente: number;
  lueckeInfo: string;
}

/**
 * AHV-Rentenrechner: Schaetzt die monatliche AHV-Rente.
 *
 * Volle Rente bei 44 Beitragsjahren (Skala 44). Jedes fehlende Jahr
 * reduziert die Rente um 1/44.
 *
 * Rente basiert auf dem massgebenden durchschnittlichen Jahreseinkommen.
 * Min CHF 1'260/Monat, Max CHF 2'520/Monat (Einzelperson).
 * Ehepaar-Plafonierung: Max 150% der Maximalrente = CHF 3'780/Monat.
 *
 * Quelle: BSV, Art. 34-35 AHVG
 */
export function calcAhvRente(input: AhvRenteInput): AhvRenteOutput {
  const parsed = AhvRenteInputSchema.parse(input);
  const { beitragsjahre, durchschnittlichesEinkommen, zivilstand } = parsed;

  const maxEinzel = CH2026.ahvRenten.maxEinzelMonat;
  const minEinzel = CH2026.ahvRenten.minEinzelMonat;
  const maxEhepaar = CH2026.ahvRenten.maxEhepaarMonat;
  const volleBeitragsjahre = 44;

  // Skala-Faktor (volle Rente bei 44 Jahren)
  const rentenSkala = Math.min(beitragsjahre, volleBeitragsjahre);
  const skalenFaktor = rentenSkala / volleBeitragsjahre;

  // Grobe Rentenformel basierend auf Durchschnittseinkommen
  // Bei ~CHF 88'200+ -> Maximalrente. Bei ~CHF 14'700 -> Minimalrente.
  // Dazwischen linear interpoliert (vereinfacht).
  const minEinkommen = 14700;
  const maxEinkommen = 88200;

  let basisRente: number;
  if (durchschnittlichesEinkommen <= 0) {
    basisRente = 0;
  } else if (durchschnittlichesEinkommen <= minEinkommen) {
    basisRente = minEinzel;
  } else if (durchschnittlichesEinkommen >= maxEinkommen) {
    basisRente = maxEinzel;
  } else {
    const t = (durchschnittlichesEinkommen - minEinkommen) / (maxEinkommen - minEinkommen);
    basisRente = minEinzel + t * (maxEinzel - minEinzel);
  }

  // Skalen-Reduktion bei fehlenden Beitragsjahren
  let monatsrente = Math.round(basisRente * skalenFaktor * 100) / 100;

  // Mindestens Minimalrente (wenn ueberhaupt Anspruch)
  if (durchschnittlichesEinkommen > 0 && monatsrente > 0) {
    monatsrente = Math.max(monatsrente, Math.round(minEinzel * skalenFaktor * 100) / 100);
  }

  // Ehepaar-Plafonierung
  let plafoniert = false;
  if (zivilstand === 'verheiratet') {
    const ehepaarMax = maxEhepaar;
    const doppelRente = monatsrente * 2;
    if (doppelRente > ehepaarMax) {
      monatsrente = Math.round(ehepaarMax / 2 * 100) / 100;
      plafoniert = true;
    }
  }

  const jahresrente = Math.round(monatsrente * 12 * 100) / 100;

  const lueckeJahre = volleBeitragsjahre - beitragsjahre;
  let lueckeInfo = '';
  if (lueckeJahre > 0) {
    lueckeInfo = `${lueckeJahre} fehlende Beitragsjahre reduzieren deine Rente.`;
  }

  return {
    monatsrente,
    jahresrente,
    rentenSkala,
    plafoniert,
    maxRente: zivilstand === 'verheiratet' ? maxEhepaar : maxEinzel,
    minRente: minEinzel,
    lueckeInfo,
  };
}
