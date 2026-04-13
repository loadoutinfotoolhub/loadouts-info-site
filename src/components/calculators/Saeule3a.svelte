<script lang="ts">
  import { calcSaeule3a, type Saeule3aOutput } from '../../lib/calculators/saeule-3a-rechner';

  interface Props {
    lang?: 'de' | 'en';
    maxMitPK?: number;
    maxOhnePK?: number;
  }

  let { lang = 'de', maxMitPK = 7258, maxOhnePK = 36288 }: Props = $props();

  let hasPensionskasse = $state(true);
  let nettoeinkommen = $state(80000);
  let einzahlung = $state(maxMitPK);
  let grenzSteuersatz = $state(25);

  const labels = $derived(lang === 'de' ? {
    hasPK: 'Hast du eine Pensionskasse?',
    yes: 'Ja',
    no: 'Nein',
    nettoeinkommen: 'Netto-Erwerbseinkommen (CHF)',
    einzahlung: 'Geplante Einzahlung (CHF)',
    steuersatz: 'Grenzsteuersatz (%)',
    maxErlaubt: 'Maximal erlaubt',
    effektiv: 'Effektive Einzahlung',
    ueber: 'Überzahlung',
    steuerersparnis: 'Steuerersparnis',
    perYear: 'pro Jahr',
    warningUeber: 'Dieser Betrag ist nicht steuerlich abzugsfähig.',
  } : {
    hasPK: 'Do you have a pension fund?',
    yes: 'Yes',
    no: 'No',
    nettoeinkommen: 'Net earned income (CHF)',
    einzahlung: 'Planned contribution (CHF)',
    steuersatz: 'Marginal tax rate (%)',
    maxErlaubt: 'Maximum allowed',
    effektiv: 'Effective contribution',
    ueber: 'Overpayment',
    steuerersparnis: 'Tax savings',
    perYear: 'per year',
    warningUeber: 'This amount is not tax-deductible.',
  });

  let result: Saeule3aOutput = $derived.by(() => {
    try {
      return calcSaeule3a({
        hasPensionskasse,
        nettoeinkommen: hasPensionskasse ? undefined : nettoeinkommen,
        einzahlung: Math.max(0, einzahlung),
        grenzSteuersatz: Math.max(0, Math.min(50, grenzSteuersatz)) / 100,
      });
    } catch {
      return { maxErlaubt: 0, effektiveEinzahlung: 0, ueberEinzahlung: 0, steuerersparnis: 0 };
    }
  });

  function fmt(n: number): string {
    return new Intl.NumberFormat('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
  }

  function fmtDec(n: number): string {
    return new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  }
</script>

<div class="grid md:grid-cols-5 gap-8">
  <!-- Inputs (40%) -->
  <div class="md:col-span-2 space-y-5">
    <!-- PK Toggle -->
    <fieldset>
      <legend class="text-sm font-medium text-[#4B5563] mb-2">{labels.hasPK}</legend>
      <div class="flex gap-3">
        <button
          type="button"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {hasPensionskasse ? 'bg-[#1E3A8A] text-white' : 'bg-gray-100 text-[#4B5563] hover:bg-gray-200'}"
          onclick={() => { hasPensionskasse = true; einzahlung = maxMitPK; }}
        >{labels.yes}</button>
        <button
          type="button"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {!hasPensionskasse ? 'bg-[#1E3A8A] text-white' : 'bg-gray-100 text-[#4B5563] hover:bg-gray-200'}"
          onclick={() => { hasPensionskasse = false; }}
        >{labels.no}</button>
      </div>
    </fieldset>

    <!-- Nettoeinkommen (only without PK) -->
    {#if !hasPensionskasse}
      <div>
        <label for="nettoeinkommen" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.nettoeinkommen}</label>
        <input
          id="nettoeinkommen"
          type="number"
          min="0"
          step="1000"
          bind:value={nettoeinkommen}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none"
        />
      </div>
    {/if}

    <!-- Einzahlung -->
    <div>
      <label for="einzahlung" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.einzahlung}</label>
      <input
        id="einzahlung"
        type="number"
        min="0"
        step="100"
        bind:value={einzahlung}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none"
      />
    </div>

    <!-- Grenzsteuersatz -->
    <div>
      <label for="steuersatz" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.steuersatz}</label>
      <input
        id="steuersatz"
        type="number"
        min="0"
        max="50"
        step="1"
        bind:value={grenzSteuersatz}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none"
      />
      <input
        type="range"
        min="0"
        max="50"
        step="1"
        bind:value={grenzSteuersatz}
        class="w-full mt-2 accent-[#1E3A8A]"
        aria-label={labels.steuersatz}
      />
    </div>
  </div>

  <!-- Results (60%) -->
  <div class="md:col-span-3">
    <!-- Primary result: Steuerersparnis -->
    <div class="bg-[#059669] text-white rounded-xl p-6 mb-4">
      <div class="text-sm opacity-90">{labels.steuerersparnis}</div>
      <div class="text-4xl font-bold mt-1">CHF {fmtDec(result.steuerersparnis)}</div>
      <div class="text-sm opacity-90 mt-1">{labels.perYear}</div>
    </div>

    <!-- Secondary results -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-xs text-[#4B5563]">{labels.maxErlaubt}</div>
        <div class="text-lg font-semibold text-[#1E3A8A] mt-1">CHF {fmt(result.maxErlaubt)}</div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-xs text-[#4B5563]">{labels.effektiv}</div>
        <div class="text-lg font-semibold text-[#1E3A8A] mt-1">CHF {fmt(result.effektiveEinzahlung)}</div>
      </div>
      <div class="bg-white rounded-lg border {result.ueberEinzahlung > 0 ? 'border-[#DC2626]' : 'border-gray-200'} p-4">
        <div class="text-xs text-[#4B5563]">{labels.ueber}</div>
        <div class="text-lg font-semibold {result.ueberEinzahlung > 0 ? 'text-[#DC2626]' : 'text-[#1E3A8A]'} mt-1">CHF {fmt(result.ueberEinzahlung)}</div>
        {#if result.ueberEinzahlung > 0}
          <div class="text-xs text-[#DC2626] mt-1">{labels.warningUeber}</div>
        {/if}
      </div>
    </div>
  </div>
</div>
