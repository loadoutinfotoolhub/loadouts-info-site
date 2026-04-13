<script lang="ts">
  import { calcZinseszins, type ZinseszinsOutput } from '../../lib/calculators/zinseszins';
  import TermTooltip from '../ui/TermTooltip.svelte';

  interface Props { lang?: 'de' | 'en'; }
  let { lang = 'de' }: Props = $props();

  let startkapital = $state(10000);
  let monatlicheEinzahlung = $state(500);
  let zinssatz = $state(5);
  let laufzeit = $state(10);

  const labels = $derived(lang === 'de' ? {
    startkapital: 'Startkapital (CHF)',
    monatlich: 'Monatliche Einzahlung (CHF)',
    zinssatz: 'Jaehrlicher Zinssatz (%)',
    laufzeit: 'Laufzeit (Jahre)',
    endkapital: 'Endkapital',
    einzahlungen: 'Total Einzahlungen',
    zinsen: 'Zinsertraege',
    zinsenAnteil: 'Zinsanteil',
    zinseszinsDef: 'Zinsen, die auf bereits verdiente Zinsen anfallen. Der Zinseszins-Effekt laesst dein Vermoegen exponentiell wachsen.',
  } : {
    startkapital: 'Starting capital (CHF)',
    monatlich: 'Monthly contribution (CHF)',
    zinssatz: 'Annual interest rate (%)',
    laufzeit: 'Duration (years)',
    endkapital: 'Final capital',
    einzahlungen: 'Total contributions',
    zinsen: 'Interest earned',
    zinsenAnteil: 'Interest share',
    zinseszinsDef: 'Interest earned on previously earned interest. The compound interest effect makes your wealth grow exponentially.',
  });

  let result: ZinseszinsOutput = $derived.by(() => {
    try {
      return calcZinseszins({ startkapital: Math.max(0, startkapital), monatlicheEinzahlung: Math.max(0, monatlicheEinzahlung), zinssatz: Math.max(0, zinssatz), laufzeit: Math.max(1, laufzeit) });
    } catch {
      return { endkapital: 0, totalEinzahlungen: 0, totalZinsen: 0, zinsenAnteil: 0, jahreDaten: [] };
    }
  });

  function fmt(n: number): string {
    return new Intl.NumberFormat('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
  }
</script>

<div class="grid md:grid-cols-5 gap-8">
  <div class="md:col-span-2 space-y-4">
    <div>
      <label for="zz-start" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.startkapital}</label>
      <input id="zz-start" type="number" min="0" step="1000" bind:value={startkapital} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none" />
    </div>
    <div>
      <label for="zz-monat" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.monatlich}</label>
      <input id="zz-monat" type="number" min="0" step="50" bind:value={monatlicheEinzahlung} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none" />
    </div>
    <div>
      <label for="zz-zins" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.zinssatz}</label>
      <input id="zz-zins" type="number" min="0" max="100" step="0.5" bind:value={zinssatz} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none" />
      <input type="range" min="0" max="15" step="0.5" bind:value={zinssatz} class="w-full mt-2 accent-[#1E3A8A]" aria-label={labels.zinssatz} />
    </div>
    <div>
      <label for="zz-laufzeit" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.laufzeit}: {laufzeit}</label>
      <input id="zz-laufzeit" type="range" min="1" max="50" bind:value={laufzeit} class="w-full accent-[#1E3A8A]" />
    </div>
  </div>

  <div class="md:col-span-3">
    <div class="bg-[#059669] text-white rounded-xl p-6 mb-4">
      <div class="text-sm opacity-90"><TermTooltip term={lang === 'de' ? 'Endkapital' : 'Final capital'} definition={labels.zinseszinsDef} id="term-zz-end" /></div>
      <div class="text-4xl font-bold mt-1">CHF {fmt(result.endkapital)}</div>
    </div>
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-xs text-[#4B5563]">{labels.einzahlungen}</div>
        <div class="text-lg font-semibold text-[#1E3A8A] mt-1">CHF {fmt(result.totalEinzahlungen)}</div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-xs text-[#4B5563]">{labels.zinsen}</div>
        <div class="text-lg font-semibold text-[#059669] mt-1">CHF {fmt(result.totalZinsen)}</div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-xs text-[#4B5563]">{labels.zinsenAnteil}</div>
        <div class="text-lg font-semibold text-[#1E3A8A] mt-1">{result.zinsenAnteil}%</div>
      </div>
    </div>
  </div>
</div>
