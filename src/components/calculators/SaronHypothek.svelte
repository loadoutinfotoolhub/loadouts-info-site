<script lang="ts">
  import { calcSaronHypothek, type SaronOutput } from '../../lib/calculators/saron-hypothek';

  interface Props {
    lang?: 'de' | 'en';
    initialHypothek?: number;
  }

  let { lang = 'de', initialHypothek = 800_000 }: Props = $props();

  let hypothekBetrag = $state(initialHypothek);
  let laufzeitJahre = $state(10);
  let bankMarge = $state(0.8);
  let saronAnnahme = $state(0.3);

  const labels = $derived(lang === 'de' ? {
    hypothek: 'Hypothek-Betrag (CHF)',
    laufzeit: 'Laufzeit (Jahre)',
    marge: 'Bank-Marge (%)',
    saron: 'SARON-Annahme (%)',
    monatsrate: 'Monatsrate',
    jahreszins: 'Jahreszins',
    totalRate: 'Gesamtzins',
    gesamtKosten: 'Gesamtkosten über Laufzeit',
    vergleich: 'Vergleich: 10J-Festhypothek (2.0%)',
    ersparnis: 'Ersparnis gegenüber Festhypothek',
    stressTest: 'Stress-Test: Was wenn SARON auf 3% steigt?',
    szenarien: 'Zinsentwicklung-Szenarien',
    szenarioName: 'Szenario',
    szenarioSaron: 'SARON',
    szenarioGesamt: 'Gesamtzins',
    szenarioMonat: 'Monatsrate',
  } : {
    hypothek: 'Mortgage amount (CHF)',
    laufzeit: 'Duration (years)',
    marge: 'Bank margin (%)',
    saron: 'SARON assumption (%)',
    monatsrate: 'Monthly payment',
    jahreszins: 'Annual interest',
    totalRate: 'Total rate',
    gesamtKosten: 'Total cost over duration',
    vergleich: 'Comparison: 10Y fixed rate (2.0%)',
    ersparnis: 'Savings vs fixed-rate',
    stressTest: 'Stress test: What if SARON rises to 3%?',
    szenarien: 'Interest rate scenarios',
    szenarioName: 'Scenario',
    szenarioSaron: 'SARON',
    szenarioGesamt: 'Total rate',
    szenarioMonat: 'Monthly',
  });

  let result: SaronOutput = $derived.by(() => {
    try {
      return calcSaronHypothek({
        hypothekBetrag: Math.max(0, hypothekBetrag),
        laufzeitJahre: Math.max(1, Math.min(30, laufzeitJahre)),
        bankMarge: Math.max(0, Math.min(5, bankMarge)),
        saronAnnahme: Math.max(-2, Math.min(10, saronAnnahme)),
      });
    } catch {
      return {
        monatsrate: 0, jahreszins: 0, totalRate: 0, gesamtKosten: 0,
        vergleichFesthypothek10J: 0, ersparnisFesthypothek: 0,
        stressTest: { name: '', saron: 0, totalRate: 0, monatsrate: 0, jahreszins: 0 },
        szenarien: [],
      };
    }
  });

  function fmt(n: number): string {
    return new Intl.NumberFormat('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
  }
</script>

<div class="grid md:grid-cols-5 gap-8">
  <!-- Inputs (40%) -->
  <div class="md:col-span-2 space-y-4">
    <div>
      <label for="hypothek" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.hypothek}</label>
      <input id="hypothek" type="number" min="0" step="50000" bind:value={hypothekBetrag}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none" />
    </div>
    <div>
      <label for="laufzeit" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.laufzeit}: {laufzeitJahre}</label>
      <input id="laufzeit" type="range" min="1" max="30" bind:value={laufzeitJahre} class="w-full accent-[#1E3A8A]" />
    </div>
    <div>
      <label for="marge" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.marge}</label>
      <input id="marge" type="number" min="0" max="5" step="0.1" bind:value={bankMarge}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none" />
    </div>
    <div>
      <label for="saron" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.saron}</label>
      <input id="saron" type="number" min="-2" max="10" step="0.1" bind:value={saronAnnahme}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none" />
    </div>
  </div>

  <!-- Results (60%) -->
  <div class="md:col-span-3">
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="bg-[#059669] text-white rounded-xl p-5">
        <div class="text-sm opacity-90">{labels.monatsrate}</div>
        <div class="text-3xl font-bold mt-1">CHF {fmt(result.monatsrate)}</div>
        <div class="text-sm opacity-90 mt-1">{result.totalRate}% {labels.totalRate}</div>
      </div>
      <div class="bg-[#1E3A8A] text-white rounded-xl p-5">
        <div class="text-sm opacity-90">{labels.ersparnis}</div>
        <div class="text-3xl font-bold mt-1 {result.ersparnisFesthypothek >= 0 ? '' : 'text-red-300'}">
          CHF {fmt(result.ersparnisFesthypothek)}
        </div>
        <div class="text-sm opacity-90 mt-1">{labels.vergleich}</div>
      </div>
    </div>

    <!-- Stress-Test -->
    <div class="bg-[#FEF2F2] border border-[#DC2626] rounded-lg p-4 mb-4">
      <div class="text-sm font-medium text-[#DC2626]">{labels.stressTest}</div>
      <div class="text-lg font-semibold text-[#DC2626] mt-1">CHF {fmt(result.stressTest.monatsrate)} / Mt. ({result.stressTest.totalRate}%)</div>
    </div>

    <!-- Szenarien-Tabelle -->
    <div class="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto">
      <h3 class="text-sm font-semibold text-[#1E3A8A] mb-3">{labels.szenarien}</h3>
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-left py-2 text-[#4B5563] font-medium">{labels.szenarioName}</th>
            <th class="text-right py-2 text-[#4B5563] font-medium">{labels.szenarioSaron}</th>
            <th class="text-right py-2 text-[#4B5563] font-medium">{labels.szenarioGesamt}</th>
            <th class="text-right py-2 text-[#4B5563] font-medium">{labels.szenarioMonat}</th>
          </tr>
        </thead>
        <tbody>
          {#each result.szenarien as s}
            <tr class="border-b border-gray-100 {s.name === 'Aktuell' || s.name === 'Current' ? 'bg-blue-50 font-semibold' : ''}">
              <td class="py-2 text-[#4B5563]">{s.name}</td>
              <td class="py-2 text-right">{s.saron}%</td>
              <td class="py-2 text-right">{s.totalRate}%</td>
              <td class="py-2 text-right font-medium">CHF {fmt(s.monatsrate)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
