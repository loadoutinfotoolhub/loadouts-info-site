<script lang="ts">
  import { calcQuellensteuer, KANTONE, TARIFE, BEWILLIGUNGEN, getTarifBeschreibung, type QuellensteuerOutput } from '../../lib/calculators/quellensteuer';
  import TermTooltip from '../ui/TermTooltip.svelte';

  interface Props {
    lang?: 'de' | 'en';
  }

  let { lang = 'de' }: Props = $props();

  let bruttolohn = $state(7000);
  let kanton = $state<(typeof KANTONE)[number]>('ZH');
  let tarif = $state<(typeof TARIFE)[number]>('A0');
  let konfession = $state<'keine' | 'reformiert' | 'katholisch'>('keine');
  let bewilligung = $state<(typeof BEWILLIGUNGEN)[number]>('B');
  let kinderAnzahl = $state(0);

  const kantonLabels: Record<string, string> = {
    ZH: 'Zuerich', BE: 'Bern', VD: 'Vaud', GE: 'Geneve', AG: 'Aargau', ZG: 'Zug', BS: 'Basel-Stadt',
  };

  const labels = $derived(lang === 'de' ? {
    brutto: 'Monatlicher Bruttolohn (CHF)',
    kanton: 'Arbeitskanton',
    tarif: 'Quellensteuer-Tarif',
    konfession: 'Konfession',
    keine: 'Keine',
    reformiert: 'Reformiert',
    katholisch: 'Katholisch',
    bewilligung: 'Aufenthaltsbewilligung',
    bewilligungLabels: { B: 'B (Aufenthalt)', L: 'L (Kurzaufenthalt)', G: 'G (Grenzgaenger)', F: 'F (Vorlaeufig Aufgenommene)', N: 'N (Asylsuchende)' } as Record<string, string>,
    quellensteuerJahr: 'Quellensteuer pro Jahr',
    quellensteuerMonat: 'Quellensteuer pro Monat',
    effektiverSatz: 'Effektiver Steuersatz',
    tarifInfo: 'Tarif-Info',
    novPflicht: 'Nachtraegliche ordentliche Veranlagung',
    novPflichtJa: 'Pflicht: Ihr Jahresbrutto uebersteigt CHF 120\'000. Sie werden ordentlich veranlagt.',
    novEmpfehlung: 'Empfehlung: Ein Antrag auf nachtraegliche ordentliche Veranlagung kann sich lohnen (z.B. wegen Saeule 3a, Berufsauslagen).',
    novNein: 'Keine Pflicht zur nachtraeglichen Veranlagung.',
    jahresbrutto: 'Jahresbrutto',
    chainCta: 'Jetzt Nettolohn berechnen',
    quellensteuerDef: 'Steuer, die der Arbeitgeber direkt vom Lohn auslaendischer Arbeitnehmer abzieht. Ersetzt die ordentliche Einkommenssteuer.',
    novDef: 'Ab CHF 120\'000 Jahreseinkommen muessen Quellensteuerpflichtige eine ordentliche Steuererklaerung einreichen.',
    tarifDef: 'Der Tarif bestimmt die Hoehe der Quellensteuer. Er richtet sich nach Zivilstand und Kinderanzahl.',
  } : {
    brutto: 'Monthly gross salary (CHF)',
    kanton: 'Work canton',
    tarif: 'Withholding tax tariff',
    konfession: 'Confession',
    keine: 'None',
    reformiert: 'Protestant',
    katholisch: 'Catholic',
    bewilligung: 'Residence permit',
    bewilligungLabels: { B: 'B (Residence)', L: 'L (Short-term)', G: 'G (Cross-border)', F: 'F (Temporarily admitted)', N: 'N (Asylum seeker)' } as Record<string, string>,
    quellensteuerJahr: 'Withholding tax per year',
    quellensteuerMonat: 'Withholding tax per month',
    effektiverSatz: 'Effective tax rate',
    tarifInfo: 'Tariff info',
    novPflicht: 'Subsequent ordinary assessment',
    novPflichtJa: 'Required: Your annual gross exceeds CHF 120,000. You will be subject to ordinary tax assessment.',
    novEmpfehlung: 'Recommended: Applying for ordinary assessment may save taxes (e.g. pillar 3a deductions, professional expenses).',
    novNein: 'No obligation for subsequent ordinary assessment.',
    jahresbrutto: 'Annual gross',
    chainCta: 'Calculate your net salary now',
    quellensteuerDef: 'Tax deducted directly from the salary of foreign employees by the employer. Replaces ordinary income tax.',
    novDef: 'Above CHF 120,000 annual income, withholding tax payers must file an ordinary tax return.',
    tarifDef: 'The tariff determines the withholding tax rate. It depends on marital status and number of children.',
  });

  let result: QuellensteuerOutput = $derived.by(() => {
    try {
      return calcQuellensteuer({
        bruttolohn: Math.max(0, bruttolohn),
        kanton,
        tarif,
        konfession,
        bewilligung,
        kinderAnzahl: Math.max(0, kinderAnzahl),
      });
    } catch {
      return {
        jahresbrutto: 0,
        quellensteuerBetrag: 0,
        effektiverSteuersatz: 0,
        quellensteuerMonat: 0,
        nachtraeglicheVeranlagungPflicht: false,
        empfehlungNovAntrag: false,
        tarifBeschreibung: '',
      };
    }
  });

  const chainLink = $derived(
    lang === 'de' ? '/de/lohnrechner' : '/en/salary-calculator'
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
      <label for="qst-brutto" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.brutto}</label>
      <input id="qst-brutto" type="number" min="0" step="100" bind:value={bruttolohn}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none" />
    </div>

    <!-- Kanton -->
    <div>
      <label for="qst-kanton" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.kanton}</label>
      <select id="qst-kanton" bind:value={kanton}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none">
        {#each KANTONE as k}
          <option value={k}>{kantonLabels[k]} ({k})</option>
        {/each}
      </select>
    </div>

    <!-- Tarif -->
    <div>
      <div class="text-sm font-medium text-[#4B5563] mb-1">
        <TermTooltip term={lang === 'de' ? 'Quellensteuer-Tarif' : 'Withholding tax tariff'} definition={labels.tarifDef} id="term-qst-tarif" />
      </div>
      <select id="qst-tarif" bind:value={tarif}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none">
        {#each TARIFE as t}
          <option value={t}>{t} - {getTarifBeschreibung(t, lang)}</option>
        {/each}
      </select>
    </div>

    <!-- Konfession -->
    <div>
      <label for="qst-konfession" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.konfession}</label>
      <select id="qst-konfession" bind:value={konfession}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none">
        <option value="keine">{labels.keine}</option>
        <option value="reformiert">{labels.reformiert}</option>
        <option value="katholisch">{labels.katholisch}</option>
      </select>
    </div>

    <!-- Bewilligung -->
    <div>
      <label for="qst-bewilligung" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.bewilligung}</label>
      <select id="qst-bewilligung" bind:value={bewilligung}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none">
        {#each BEWILLIGUNGEN as b}
          <option value={b}>{labels.bewilligungLabels[b]}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Results (60%) -->
  <div class="md:col-span-3">
    <!-- Primary result -->
    <div class="bg-[#1E3A8A] text-white rounded-xl p-6 mb-4">
      <div class="text-sm opacity-90">{labels.quellensteuerMonat}</div>
      <div class="text-4xl font-bold mt-1">CHF {fmtDec(result.quellensteuerMonat)}</div>
      <div class="text-sm opacity-90 mt-2">{labels.quellensteuerJahr}: CHF {fmtDec(result.quellensteuerBetrag)}</div>
    </div>

    <!-- Secondary results -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-xs text-[#4B5563]">
          <TermTooltip term={labels.effektiverSatz} definition={labels.quellensteuerDef} id="term-qst-effektiv" />
        </div>
        <div class="text-2xl font-semibold text-[#1E3A8A] mt-1">{result.effektiverSteuersatz}%</div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-xs text-[#4B5563]">{labels.jahresbrutto}</div>
        <div class="text-2xl font-semibold text-[#1E3A8A] mt-1">CHF {fmt(result.jahresbrutto)}</div>
      </div>
    </div>

    <!-- NOV Info -->
    <div class="rounded-lg border p-4 mb-4 {result.nachtraeglicheVeranlagungPflicht ? 'border-[#DC2626] bg-red-50' : result.empfehlungNovAntrag ? 'border-[#059669] bg-green-50' : 'border-gray-200 bg-white'}">
      <div class="text-sm font-medium mb-1">
        <TermTooltip
          term={labels.novPflicht}
          definition={labels.novDef}
          id="term-qst-nov"
        />
      </div>
      <p class="text-sm text-[#4B5563]">
        {#if result.nachtraeglicheVeranlagungPflicht}
          {labels.novPflichtJa}
        {:else if result.empfehlungNovAntrag}
          {labels.novEmpfehlung}
        {:else}
          {labels.novNein}
        {/if}
      </p>
    </div>

    <!-- Tarif Info -->
    <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div class="text-xs text-[#4B5563]">{labels.tarifInfo}</div>
      <div class="text-sm font-medium text-[#1E3A8A] mt-1">{result.tarifBeschreibung}</div>
    </div>

    <!-- Chain-Link CTA -->
    <a href={chainLink}
      class="block w-full text-center bg-[#059669] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#047857] transition-colors">
      {labels.chainCta} &rarr;
    </a>
  </div>
</div>
