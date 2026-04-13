<script lang="ts">
  import { calcKapitalbezugssteuer, KANTONE, type KapitalbezugssteuerOutput } from '../../lib/calculators/kapitalbezugssteuer';
  import TermTooltip from '../ui/TermTooltip.svelte';

  interface Props { lang?: 'de' | 'en'; }
  let { lang = 'de' }: Props = $props();

  let bezugsbetrag = $state(200000);
  let kanton = $state<(typeof KANTONE)[number]>('ZH');
  let zivilstand = $state<'ledig' | 'verheiratet'>('ledig');

  const kantonLabels: Record<string, string> = { ZH: 'Zuerich', BE: 'Bern', VD: 'Vaud', GE: 'Geneve', AG: 'Aargau', ZG: 'Zug', BS: 'Basel-Stadt' };

  const labels = $derived(lang === 'de' ? {
    bezugsbetrag: 'Bezugsbetrag (CHF)',
    kanton: 'Kanton',
    zivilstand: 'Zivilstand',
    ledig: 'Ledig',
    verheiratet: 'Verheiratet',
    steuerBetrag: 'Kapitalbezugssteuer',
    nettoAuszahlung: 'Netto-Auszahlung',
    effektiverSatz: 'Effektiver Steuersatz',
    steuerBund: 'Bundessteuer',
    steuerKanton: 'Kanton/Gemeinde',
    chainCta: 'Jetzt Saeule 3a Steuerersparnis berechnen',
    bezugsDef: 'Steuer auf den Bezug von Vorsorgekapital (Saeule 3a, Pensionskasse, Freizuegigkeit). Getrennt besteuert, tiefer als Einkommenssteuer.',
    tipp: 'Tipp: Gestaffelter Bezug ueber mehrere Jahre senkt die Progression und damit die Steuer.',
  } : {
    bezugsbetrag: 'Withdrawal amount (CHF)',
    kanton: 'Canton',
    zivilstand: 'Marital status',
    ledig: 'Single',
    verheiratet: 'Married',
    steuerBetrag: 'Capital withdrawal tax',
    nettoAuszahlung: 'Net payout',
    effektiverSatz: 'Effective tax rate',
    steuerBund: 'Federal tax',
    steuerKanton: 'Canton/municipality',
    chainCta: 'Calculate pillar 3a tax savings now',
    bezugsDef: 'Tax on withdrawal of pension capital (pillar 3a, pension fund, vested benefits). Taxed separately, lower than income tax.',
    tipp: 'Tip: Staggered withdrawals over several years reduces progression and tax.',
  });

  let result: KapitalbezugssteuerOutput = $derived.by(() => {
    try {
      return calcKapitalbezugssteuer({ bezugsbetrag: Math.max(0, bezugsbetrag), kanton, zivilstand });
    } catch {
      return { steuerBetrag: 0, effektiverSatz: 0, nettoAuszahlung: 0, steuerBund: 0, steuerKantonGemeinde: 0 };
    }
  });

  function fmt(n: number): string { return new Intl.NumberFormat('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n); }
  function fmtDec(n: number): string { return new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n); }
</script>

<div class="grid md:grid-cols-5 gap-8">
  <div class="md:col-span-2 space-y-4">
    <div>
      <label for="kb-betrag" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.bezugsbetrag}</label>
      <input id="kb-betrag" type="number" min="0" step="10000" bind:value={bezugsbetrag} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none" />
    </div>
    <div>
      <label for="kb-kanton" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.kanton}</label>
      <select id="kb-kanton" bind:value={kanton} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none">
        {#each KANTONE as k}<option value={k}>{kantonLabels[k]} ({k})</option>{/each}
      </select>
    </div>
    <fieldset>
      <legend class="text-sm font-medium text-[#4B5563] mb-2">{labels.zivilstand}</legend>
      <div class="flex gap-3">
        <button type="button" class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {zivilstand === 'ledig' ? 'bg-[#1E3A8A] text-white' : 'bg-gray-100 text-[#4B5563] hover:bg-gray-200'}" onclick={() => zivilstand = 'ledig'}>{labels.ledig}</button>
        <button type="button" class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {zivilstand === 'verheiratet' ? 'bg-[#1E3A8A] text-white' : 'bg-gray-100 text-[#4B5563] hover:bg-gray-200'}" onclick={() => zivilstand = 'verheiratet'}>{labels.verheiratet}</button>
      </div>
    </fieldset>
  </div>

  <div class="md:col-span-3">
    <div class="bg-[#1E3A8A] text-white rounded-xl p-6 mb-4">
      <div class="text-sm opacity-90"><TermTooltip term={labels.steuerBetrag} definition={labels.bezugsDef} id="term-kb-steuer" /></div>
      <div class="text-4xl font-bold mt-1">CHF {fmtDec(result.steuerBetrag)}</div>
      <div class="text-sm opacity-90 mt-1">{labels.effektiverSatz}: {result.effektiverSatz}%</div>
    </div>
    <div class="bg-[#059669] text-white rounded-xl p-5 mb-4">
      <div class="text-sm opacity-90">{labels.nettoAuszahlung}</div>
      <div class="text-3xl font-bold mt-1">CHF {fmt(result.nettoAuszahlung)}</div>
    </div>
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-xs text-[#4B5563]">{labels.steuerBund}</div>
        <div class="text-lg font-semibold text-[#1E3A8A] mt-1">CHF {fmtDec(result.steuerBund)}</div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-xs text-[#4B5563]">{labels.steuerKanton}</div>
        <div class="text-lg font-semibold text-[#1E3A8A] mt-1">CHF {fmtDec(result.steuerKantonGemeinde)}</div>
      </div>
    </div>
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-[#4B5563] mb-4">{labels.tipp}</div>
    <a href={lang === 'de' ? '/de/saeule-3a-rechner' : '/en/pillar-3a-calculator'} class="block w-full text-center bg-[#059669] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#047857] transition-colors">{labels.chainCta} &rarr;</a>
  </div>
</div>
