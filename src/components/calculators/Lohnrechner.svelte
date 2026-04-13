<script lang="ts">
  import { calcLohnrechner, KANTONE, type LohnrechnerOutput } from '../../lib/calculators/lohnrechner';
  import TermTooltip from '../ui/TermTooltip.svelte';

  interface Props {
    lang?: 'de' | 'en';
  }

  let { lang = 'de' }: Props = $props();

  let bruttolohn = $state(7083);
  let kanton = $state<(typeof KANTONE)[number]>('ZH');
  let zivilstand = $state<'ledig' | 'verheiratet'>('ledig');
  let konfession = $state<'keine' | 'reformiert' | 'katholisch'>('keine');
  let alter = $state(35);
  let dreizehnterMonatslohn = $state(false);

  const kantonLabels: Record<string, string> = {
    ZH: 'Zürich', BE: 'Bern', VD: 'Vaud', GE: 'Genève', AG: 'Aargau', ZG: 'Zug', BS: 'Basel-Stadt',
  };

  const labels = $derived(lang === 'de' ? {
    brutto: 'Monatlicher Bruttolohn (CHF)',
    kanton: 'Kanton',
    zivilstand: 'Zivilstand',
    ledig: 'Ledig',
    verheiratet: 'Verheiratet',
    konfession: 'Konfession',
    keine: 'Keine',
    reformiert: 'Reformiert',
    katholisch: 'Katholisch',
    alter: 'Alter',
    dreizehnter: '13. Monatslohn',
    jahresNetto: 'Jahresnetto',
    monatsNetto: 'Monatsnetto',
    grenzsteuersatz: 'Grenzsteuersatz',
    grenzsteuersatzDef: 'Der Grenzsteuersatz ist der Prozentsatz, den du auf deinen naechsten zusaetzlich verdienten Franken an Steuern zahlen wuerdest. Er bestimmt, wie viel du durch Abzuege (z.B. Saeule 3a) sparen kannst.',
    abzuege: 'Abzüge im Detail',
    ahv: 'AHV (5.3%)',
    iv: 'IV (0.7%)',
    eo: 'EO (0.25%)',
    alv: 'ALV (1.1%)',
    bvg: 'Pensionskasse (BVG)',
    steuer: 'Einkommenssteuer',
    kirchensteuer: 'Kirchensteuer',
    total: 'Total Abzüge',
    perYear: 'pro Jahr',
    chainCta: 'Jetzt Steuer sparen mit Säule 3a',
  } : {
    brutto: 'Monthly gross salary (CHF)',
    kanton: 'Canton',
    zivilstand: 'Marital status',
    ledig: 'Single',
    verheiratet: 'Married',
    konfession: 'Confession',
    keine: 'None',
    reformiert: 'Protestant',
    katholisch: 'Catholic',
    alter: 'Age',
    dreizehnter: '13th salary',
    jahresNetto: 'Annual net',
    monatsNetto: 'Monthly net',
    grenzsteuersatz: 'Marginal tax rate',
    grenzsteuersatzDef: 'The marginal tax rate is the percentage of tax you would pay on your next additional franc earned. It determines how much you can save through deductions (e.g. pillar 3a).',
    abzuege: 'Deductions breakdown',
    ahv: 'AHV (5.3%)',
    iv: 'IV (0.7%)',
    eo: 'EO (0.25%)',
    alv: 'ALV (1.1%)',
    bvg: 'Pension fund (BVG)',
    steuer: 'Income tax',
    kirchensteuer: 'Church tax',
    total: 'Total deductions',
    perYear: 'per year',
    chainCta: 'Save taxes with Pillar 3a now',
  });

  let result: LohnrechnerOutput = $derived.by(() => {
    try {
      return calcLohnrechner({
        bruttolohn: Math.max(0, bruttolohn),
        kanton,
        zivilstand,
        konfession,
        alter: Math.max(18, Math.min(70, alter)),
        dreizehnterMonatslohn,
      });
    } catch {
      return {
        jahresBrutto: 0, monatsBrutto: 0, ahv: 0, iv: 0, eo: 0, alv: 0, bvg: 0,
        steuer: 0, kirchensteuer: 0, totalAbzuege: 0, jahresNetto: 0, monatsNetto: 0, grenzSteuersatz: 0,
      };
    }
  });

  const chainLink = $derived(
    lang === 'de'
      ? `/de/saeule-3a-rechner?in_grenzsteuersatz=${result.grenzSteuersatz}`
      : `/en/pillar-3a-calculator?in_grenzsteuersatz=${result.grenzSteuersatz}`
  );

  function fmt(n: number): string {
    return new Intl.NumberFormat('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
  }

  function fmtDec(n: number): string {
    return new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  }
</script>

<div class="grid md:grid-cols-5 gap-8">
  <!-- Inputs (40%) -->
  <div class="md:col-span-2 space-y-4">
    <!-- Bruttolohn -->
    <div>
      <label for="bruttolohn" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.brutto}</label>
      <input id="bruttolohn" type="number" min="0" step="100" bind:value={bruttolohn}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none" />
    </div>

    <!-- Kanton -->
    <div>
      <label for="kanton" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.kanton}</label>
      <select id="kanton" bind:value={kanton}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none">
        {#each KANTONE as k}
          <option value={k}>{kantonLabels[k]} ({k})</option>
        {/each}
      </select>
    </div>

    <!-- Zivilstand -->
    <fieldset>
      <legend class="text-sm font-medium text-[#4B5563] mb-2">{labels.zivilstand}</legend>
      <div class="flex gap-3">
        <button type="button"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {zivilstand === 'ledig' ? 'bg-[#1E3A8A] text-white' : 'bg-gray-100 text-[#4B5563] hover:bg-gray-200'}"
          onclick={() => zivilstand = 'ledig'}>{labels.ledig}</button>
        <button type="button"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {zivilstand === 'verheiratet' ? 'bg-[#1E3A8A] text-white' : 'bg-gray-100 text-[#4B5563] hover:bg-gray-200'}"
          onclick={() => zivilstand = 'verheiratet'}>{labels.verheiratet}</button>
      </div>
    </fieldset>

    <!-- Konfession -->
    <div>
      <label for="konfession" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.konfession}</label>
      <select id="konfession" bind:value={konfession}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none">
        <option value="keine">{labels.keine}</option>
        <option value="reformiert">{labels.reformiert}</option>
        <option value="katholisch">{labels.katholisch}</option>
      </select>
    </div>

    <!-- Alter -->
    <div>
      <label for="alter" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.alter}: {alter}</label>
      <input id="alter" type="range" min="18" max="70" bind:value={alter} class="w-full accent-[#1E3A8A]" />
    </div>

    <!-- 13. Monatslohn Toggle -->
    <label class="flex items-center gap-3 cursor-pointer">
      <input type="checkbox" bind:checked={dreizehnterMonatslohn}
        class="w-5 h-5 rounded border-gray-300 text-[#1E3A8A] focus:ring-[#1E3A8A]" />
      <span class="text-sm font-medium text-[#4B5563]">{labels.dreizehnter}</span>
    </label>
  </div>

  <!-- Results (60%) -->
  <div class="md:col-span-3">
    <!-- Primary results -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="bg-[#059669] text-white rounded-xl p-5">
        <div class="text-sm opacity-90">{labels.monatsNetto}</div>
        <div class="text-3xl font-bold mt-1">CHF {fmt(result.monatsNetto)}</div>
      </div>
      <div class="bg-[#1E3A8A] text-white rounded-xl p-5">
        <div class="text-sm opacity-90">{labels.jahresNetto}</div>
        <div class="text-3xl font-bold mt-1">CHF {fmt(result.jahresNetto)}</div>
      </div>
    </div>

    <!-- Grenzsteuersatz -->
    <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div class="text-xs text-[#4B5563]"><TermTooltip term={labels.grenzsteuersatz} definition={labels.grenzsteuersatzDef} id="term-grenzsteuersatz-lohn" /></div>
      <div class="text-2xl font-semibold text-[#1E3A8A] mt-1">{result.grenzSteuersatz}%</div>
    </div>

    <!-- Abzüge Detail -->
    <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <h3 class="text-sm font-semibold text-[#1E3A8A] mb-3">{labels.abzuege}</h3>
      <div class="space-y-2 text-sm">
        {#each [
          [labels.ahv, result.ahv],
          [labels.iv, result.iv],
          [labels.eo, result.eo],
          [labels.alv, result.alv],
          [labels.bvg, result.bvg],
          [labels.steuer, result.steuer],
          ...(result.kirchensteuer > 0 ? [[labels.kirchensteuer, result.kirchensteuer]] : []),
        ] as [label, value]}
          <div class="flex justify-between">
            <span class="text-[#4B5563]">{label}</span>
            <span class="font-medium text-[#4B5563]">CHF {fmtDec(value)} <span class="text-xs opacity-60">/ {labels.perYear}</span></span>
          </div>
        {/each}
        <div class="flex justify-between border-t border-gray-200 pt-2 mt-2">
          <span class="font-semibold text-[#1E3A8A]">{labels.total}</span>
          <span class="font-semibold text-[#1E3A8A]">CHF {fmtDec(result.totalAbzuege)}</span>
        </div>
      </div>
    </div>

    <!-- Chain-Link CTA -->
    <a href={chainLink}
      class="block w-full text-center bg-[#059669] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#047857] transition-colors">
      {labels.chainCta} →
    </a>
  </div>
</div>
