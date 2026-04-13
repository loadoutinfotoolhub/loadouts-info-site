<script lang="ts">
  import { calcTragbarkeit, type TragbarkeitOutput } from '../../lib/calculators/tragbarkeit';

  interface Props {
    lang?: 'de' | 'en';
  }

  let { lang = 'de' }: Props = $props();

  let immobilienwert = $state(1_000_000);
  let bruttoeinkommen = $state(180_000);
  let eigenkapital = $state(200_000);

  const labels = $derived(lang === 'de' ? {
    immobilienwert: 'Immobilienwert (CHF)',
    einkommen: 'Bruttoeinkommen pro Jahr (CHF)',
    eigenkapital: 'Eigenkapital (CHF)',
    hypothek: 'Hypothek',
    belehnung: 'Belehnung',
    tragbar: 'Tragbar',
    nichtTragbar: 'Nicht tragbar',
    tragbarkeitRatio: 'Tragbarkeitsquote',
    maxRatio: 'Max. erlaubt: 33%',
    monatlich: 'Monatliche Wohnkosten',
    jaehrlich: 'Jährliche Wohnkosten',
    benoetigtesEinkommen: 'Benötigtes Einkommen',
    fehlendesEK: 'Fehlendes Eigenkapital',
    kostenDetail: 'Kostenaufstellung',
    kalkZins: 'Kalkulatorischer Zins (5%)',
    nebenkosten: 'Nebenkosten (1%)',
    amortisation: 'Amortisation',
    total: 'Total jährlich',
    chainCta: 'SARON-Hypothek berechnen',
    eigenkapitalMin: 'Minimum 20% Eigenkapital',
  } : {
    immobilienwert: 'Property value (CHF)',
    einkommen: 'Annual gross income (CHF)',
    eigenkapital: 'Down payment (CHF)',
    hypothek: 'Mortgage',
    belehnung: 'Loan-to-value',
    tragbar: 'Affordable',
    nichtTragbar: 'Not affordable',
    tragbarkeitRatio: 'Affordability ratio',
    maxRatio: 'Max. allowed: 33%',
    monatlich: 'Monthly housing cost',
    jaehrlich: 'Annual housing cost',
    benoetigtesEinkommen: 'Required income',
    fehlendesEK: 'Missing down payment',
    kostenDetail: 'Cost breakdown',
    kalkZins: 'Imputed interest (5%)',
    nebenkosten: 'Maintenance (1%)',
    amortisation: 'Amortisation',
    total: 'Total per year',
    chainCta: 'Calculate SARON mortgage',
    eigenkapitalMin: 'Minimum 20% down payment',
  });

  let result: TragbarkeitOutput = $derived.by(() => {
    try {
      return calcTragbarkeit({
        immobilienwert: Math.max(0, immobilienwert),
        bruttoeinkommen: Math.max(0, bruttoeinkommen),
        eigenkapital: Math.max(0, eigenkapital),
      });
    } catch {
      return {
        hypothek: 0, belehnung: 0, eigenkapitalQuote: 0, eigenkapitalMin: 0,
        fehlendesEigenkapital: 0, kalkZins: 0, kalkZinsKosten: 0,
        nebenkostenPauschale: 0, amortisation: 0, jaehrlicheWohnkosten: 0,
        monatlicheWohnkosten: 0, tragbarkeitRatio: 0, tragbar: false,
        benoetigtesEinkommen: 0,
      };
    }
  });

  const chainLink = $derived(
    lang === 'de'
      ? `/de/saron-hypothek-rechner?in_hypothek=${result.hypothek}`
      : `/en/saron-mortgage-calculator?in_hypothek=${result.hypothek}`
  );

  function fmt(n: number): string {
    return new Intl.NumberFormat('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
  }

  const ratioColor = $derived(
    result.tragbarkeitRatio <= 25 ? 'text-[#059669]' :
    result.tragbarkeitRatio <= 33 ? 'text-[#D97706]' :
    'text-[#DC2626]'
  );

  const ratioBg = $derived(
    result.tragbar ? 'bg-[#059669]' : 'bg-[#DC2626]'
  );
</script>

<div class="grid md:grid-cols-5 gap-8">
  <!-- Inputs (40%) -->
  <div class="md:col-span-2 space-y-4">
    <div>
      <label for="immobilienwert" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.immobilienwert}</label>
      <input id="immobilienwert" type="number" min="0" step="50000" bind:value={immobilienwert}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none" />
    </div>

    <div>
      <label for="einkommen" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.einkommen}</label>
      <input id="einkommen" type="number" min="0" step="5000" bind:value={bruttoeinkommen}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none" />
    </div>

    <div>
      <label for="eigenkapital" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.eigenkapital}</label>
      <input id="eigenkapital" type="number" min="0" step="10000" bind:value={eigenkapital}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none" />
      <p class="text-xs text-[#4B5563] mt-1">{labels.eigenkapitalMin}: CHF {fmt(result.eigenkapitalMin)}</p>
    </div>
  </div>

  <!-- Results (60%) -->
  <div class="md:col-span-3">
    <!-- Primary: Tragbarkeit -->
    <div class="{ratioBg} text-white rounded-xl p-6 mb-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm opacity-90">{labels.tragbarkeitRatio}</div>
          <div class="text-4xl font-bold mt-1">{result.tragbarkeitRatio}%</div>
          <div class="text-sm opacity-90 mt-1">{labels.maxRatio}</div>
        </div>
        <div class="text-xl font-bold">
          {result.tragbar ? labels.tragbar : labels.nichtTragbar}
        </div>
      </div>
    </div>

    <!-- Key metrics -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-xs text-[#4B5563]">{labels.monatlich}</div>
        <div class="text-lg font-semibold text-[#1E3A8A] mt-1">CHF {fmt(result.monatlicheWohnkosten)}</div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-xs text-[#4B5563]">{labels.hypothek}</div>
        <div class="text-lg font-semibold text-[#1E3A8A] mt-1">CHF {fmt(result.hypothek)}</div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-xs text-[#4B5563]">{labels.benoetigtesEinkommen}</div>
        <div class="text-lg font-semibold text-[#1E3A8A] mt-1">CHF {fmt(result.benoetigtesEinkommen)}</div>
      </div>
    </div>

    {#if result.fehlendesEigenkapital > 0}
      <div class="bg-[#FEF2F2] border border-[#DC2626] rounded-lg p-4 mb-4">
        <div class="text-sm font-medium text-[#DC2626]">{labels.fehlendesEK}: CHF {fmt(result.fehlendesEigenkapital)}</div>
      </div>
    {/if}

    <!-- Cost breakdown -->
    <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <h3 class="text-sm font-semibold text-[#1E3A8A] mb-3">{labels.kostenDetail}</h3>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-[#4B5563]">{labels.kalkZins}</span>
          <span class="font-medium">CHF {fmt(result.kalkZinsKosten)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-[#4B5563]">{labels.nebenkosten}</span>
          <span class="font-medium">CHF {fmt(result.nebenkostenPauschale)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-[#4B5563]">{labels.amortisation}</span>
          <span class="font-medium">CHF {fmt(result.amortisation)}</span>
        </div>
        <div class="flex justify-between border-t border-gray-200 pt-2 mt-2">
          <span class="font-semibold text-[#1E3A8A]">{labels.total}</span>
          <span class="font-semibold text-[#1E3A8A]">CHF {fmt(result.jaehrlicheWohnkosten)}</span>
        </div>
      </div>
    </div>

    <!-- Bar chart visualization -->
    <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div class="space-y-2">
        {#each [
          [labels.kalkZins, result.kalkZinsKosten, '#1E3A8A'],
          [labels.nebenkosten, result.nebenkostenPauschale, '#4B5563'],
          [labels.amortisation, result.amortisation, '#059669'],
        ] as [label, value, color]}
          {@const pct = result.jaehrlicheWohnkosten > 0 ? (value / result.jaehrlicheWohnkosten) * 100 : 0}
          <div>
            <div class="flex justify-between text-xs text-[#4B5563] mb-1">
              <span>{label}</span>
              <span>CHF {fmt(value)} / Mt.</span>
            </div>
            <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all" style="width: {pct}%; background-color: {color};" />
            </div>
          </div>
        {/each}
      </div>
    </div>

    <a href={chainLink}
      class="block w-full text-center bg-[#059669] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#047857] transition-colors">
      {labels.chainCta} →
    </a>
  </div>
</div>
