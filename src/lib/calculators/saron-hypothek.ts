import { z } from 'zod';

export const SaronInputSchema = z.object({
  hypothekBetrag: z.number().min(0).max(50_000_000),
  laufzeitJahre: z.number().int().min(1).max(30),
  bankMarge: z.number().min(0).max(5),
  saronAnnahme: z.number().min(-2).max(10),
});

export type SaronInput = z.infer<typeof SaronInputSchema>;

export interface SaronScenario {
  name: string;
  saron: number;
  totalRate: number;
  monatsrate: number;
  jahreszins: number;
}

export interface SaronOutput {
  monatsrate: number;
  jahreszins: number;
  totalRate: number;
  gesamtKosten: number;
  vergleichFesthypothek10J: number;
  ersparnisFesthypothek: number;
  stressTest: SaronScenario;
  szenarien: SaronScenario[];
}

const FESTHYPOTHEK_10J_RATE = 0.02; // 2.0% typischer 10J-Festhypothek-Satz 2026

function calcScenario(name: string, hypothek: number, saron: number, marge: number): SaronScenario {
  const totalRate = Math.max(0, saron + marge);
  const jahreszins = hypothek * totalRate;
  return {
    name,
    saron: Math.round(saron * 10000) / 100,
    totalRate: Math.round(totalRate * 10000) / 100,
    monatsrate: Math.round(jahreszins / 12),
    jahreszins: Math.round(jahreszins),
  };
}

/**
 * Berechnet SARON-Hypothek Kosten und Vergleiche.
 *
 * SARON (Swiss Average Rate Overnight) ist der offizielle Schweizer
 * Referenzzinssatz, veröffentlicht von der SNB.
 *
 * @see SNB https://www.snb.ch/de/der-saron/saron-rate
 */
export function calcSaronHypothek(input: SaronInput): SaronOutput {
  const parsed = SaronInputSchema.parse(input);
  const margeDecimal = parsed.bankMarge / 100;
  const saronDecimal = parsed.saronAnnahme / 100;

  const totalRate = Math.max(0, saronDecimal + margeDecimal);
  const jahreszins = parsed.hypothekBetrag * totalRate;
  const monatsrate = jahreszins / 12;
  const gesamtKosten = jahreszins * parsed.laufzeitJahre;

  // Vergleich mit 10J-Festhypothek
  const festJahreszins = parsed.hypothekBetrag * FESTHYPOTHEK_10J_RATE;
  const festGesamtKosten = festJahreszins * parsed.laufzeitJahre;
  const ersparnis = festGesamtKosten - gesamtKosten;

  // Stress-Test: SARON steigt auf 3%
  const stressTest = calcScenario('Stress-Test (SARON 3%)', parsed.hypothekBetrag, 0.03, margeDecimal);

  // Szenarien
  const szenarien: SaronScenario[] = [
    calcScenario('Negativ-SARON', parsed.hypothekBetrag, -0.005, margeDecimal),
    calcScenario('SARON 0%', parsed.hypothekBetrag, 0, margeDecimal),
    calcScenario('Aktuell', parsed.hypothekBetrag, saronDecimal, margeDecimal),
    calcScenario('SARON 1%', parsed.hypothekBetrag, 0.01, margeDecimal),
    calcScenario('SARON 2%', parsed.hypothekBetrag, 0.02, margeDecimal),
    calcScenario('SARON 3%', parsed.hypothekBetrag, 0.03, margeDecimal),
    calcScenario('SARON 5%', parsed.hypothekBetrag, 0.05, margeDecimal),
  ];

  return {
    monatsrate: Math.round(monatsrate),
    jahreszins: Math.round(jahreszins),
    totalRate: Math.round(totalRate * 10000) / 100,
    gesamtKosten: Math.round(gesamtKosten),
    vergleichFesthypothek10J: Math.round(festJahreszins),
    ersparnisFesthypothek: Math.round(ersparnis),
    stressTest,
    szenarien,
  };
}
