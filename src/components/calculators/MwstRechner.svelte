<script lang="ts">
  import { calcMwst, SATZ_BEZEICHNUNGEN, type MwstOutput, type MwstSatz } from '../../lib/calculators/mwst';
  import TermTooltip from '../ui/TermTooltip.svelte';

  interface Props { lang?: 'de' | 'en'; }
  let { lang = 'de' }: Props = $props();

  let betrag = $state(100);
  let satz = $state<MwstSatz>('normal');
  let richtung = $state<'inkl' | 'exkl'>('exkl');

  const labels = $derived(lang === 'de' ? {
    betrag: 'Betrag (CHF)',
    satz: 'MwSt-Satz',
    normal: 'Normalsatz (8.1%)',
    reduziert: 'Reduzierter Satz (2.6%)',
    beherbergung: 'Beherbergung (3.8%)',
    richtung: 'Berechnung',
    exkl: 'Netto → Brutto (+ MwSt)',
    inkl: 'Brutto → Netto (- MwSt)',
    mwstBetrag: 'MwSt-Betrag',
    betragInkl: 'Betrag inkl. MwSt',
    betragExkl: 'Betrag exkl. MwSt',
    mwstSatz: 'Angewandter Satz',
    mwstDef: 'Mehrwertsteuer: Indirekte Steuer auf Waren und Dienstleistungen in der Schweiz. 3 Saetze: Normal (8.1%), Reduziert (2.6%), Beherbergung (3.8%).',
  } : {
    betrag: 'Amount (CHF)',
    satz: 'VAT rate',
    normal: 'Standard rate (8.1%)',
    reduziert: 'Reduced rate (2.6%)',
    beherbergung: 'Accommodation (3.8%)',
    richtung: 'Calculation',
    exkl: 'Net → Gross (+ VAT)',
    inkl: 'Gross → Net (- VAT)',
    mwstBetrag: 'VAT amount',
    betragInkl: 'Amount incl. VAT',
    betragExkl: 'Amount excl. VAT',
    mwstSatz: 'Applied rate',
    mwstDef: 'Value Added Tax: Indirect tax on goods and services in Switzerland. 3 rates: Standard (8.1%), Reduced (2.6%), Accommodation (3.8%).',
  });

  let result: MwstOutput = $derived.by(() => {
    try {
      return calcMwst({ betrag: Math.max(0, betrag), satz, richtung });
    } catch {
      return { betragInkl: 0, betragExkl: 0, mwstBetrag: 0, mwstSatz: 0, satzBezeichnung: '' };
    }
  });

  function fmtDec(n: number): string {
    return new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  }
</script>

<div class="grid md:grid-cols-5 gap-8">
  <div class="md:col-span-2 space-y-4">
    <div>
      <label for="mwst-betrag" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.betrag}</label>
      <input id="mwst-betrag" type="number" min="0" step="10" bind:value={betrag} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none" />
    </div>
    <div>
      <div class="text-sm font-medium text-[#4B5563] mb-1">
        <TermTooltip term={lang === 'de' ? 'MwSt-Satz' : 'VAT rate'} definition={labels.mwstDef} id="term-mwst-satz" />
      </div>
      <select id="mwst-satz" bind:value={satz} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none">
        <option value="normal">{labels.normal}</option>
        <option value="reduziert">{labels.reduziert}</option>
        <option value="beherbergung">{labels.beherbergung}</option>
      </select>
    </div>
    <fieldset>
      <legend class="text-sm font-medium text-[#4B5563] mb-2">{labels.richtung}</legend>
      <div class="flex gap-3">
        <button type="button" class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {richtung === 'exkl' ? 'bg-[#1E3A8A] text-white' : 'bg-gray-100 text-[#4B5563] hover:bg-gray-200'}" onclick={() => richtung = 'exkl'}>{labels.exkl}</button>
        <button type="button" class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {richtung === 'inkl' ? 'bg-[#1E3A8A] text-white' : 'bg-gray-100 text-[#4B5563] hover:bg-gray-200'}" onclick={() => richtung = 'inkl'}>{labels.inkl}</button>
      </div>
    </fieldset>
  </div>

  <div class="md:col-span-3">
    <div class="bg-[#059669] text-white rounded-xl p-6 mb-4">
      <div class="text-sm opacity-90">{labels.mwstBetrag}</div>
      <div class="text-4xl font-bold mt-1">CHF {fmtDec(result.mwstBetrag)}</div>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-xs text-[#4B5563]">{labels.betragExkl}</div>
        <div class="text-lg font-semibold text-[#1E3A8A] mt-1">CHF {fmtDec(result.betragExkl)}</div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-xs text-[#4B5563]">{labels.betragInkl}</div>
        <div class="text-lg font-semibold text-[#1E3A8A] mt-1">CHF {fmtDec(result.betragInkl)}</div>
      </div>
    </div>
  </div>
</div>
