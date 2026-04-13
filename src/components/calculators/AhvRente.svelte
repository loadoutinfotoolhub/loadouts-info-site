<script lang="ts">
  import { calcAhvRente, type AhvRenteOutput } from '../../lib/calculators/ahv-rente';
  import TermTooltip from '../ui/TermTooltip.svelte';

  interface Props { lang?: 'de' | 'en'; }
  let { lang = 'de' }: Props = $props();

  let beitragsjahre = $state(44);
  let durchschnittlichesEinkommen = $state(85000);
  let zivilstand = $state<'ledig' | 'verheiratet'>('ledig');

  const labels = $derived(lang === 'de' ? {
    beitragsjahre: 'Beitragsjahre',
    einkommen: 'Durchschnittliches Jahreseinkommen (CHF)',
    zivilstand: 'Zivilstand',
    ledig: 'Ledig',
    verheiratet: 'Verheiratet',
    monatsrente: 'Geschaetzte AHV-Monatsrente',
    jahresrente: 'Jahresrente',
    plafonierung: 'Ehepaar-Plafonierung',
    plafoniert: 'Ja, die Summe beider Renten wird auf 150% einer Maximalrente begrenzt.',
    nichtPlafoniert: 'Nein',
    luecke: 'Beitragsluecke',
    ahvDef: 'Die AHV (Alters- und Hinterlassenenversicherung) ist die 1. Saeule der Schweizer Altersvorsorge. Sie deckt den Existenzbedarf.',
    beitragDef: 'Fuer die volle AHV-Rente brauchst du 44 lueckenlose Beitragsjahre. Jedes fehlende Jahr kuerzt die Rente.',
  } : {
    beitragsjahre: 'Contribution years',
    einkommen: 'Average annual income (CHF)',
    zivilstand: 'Marital status',
    ledig: 'Single',
    verheiratet: 'Married',
    monatsrente: 'Estimated AHV monthly pension',
    jahresrente: 'Annual pension',
    plafonierung: 'Couple cap (Plafonierung)',
    plafoniert: 'Yes, the combined pensions are capped at 150% of one maximum pension.',
    nichtPlafoniert: 'No',
    luecke: 'Contribution gap',
    ahvDef: 'The AHV (Old-age and Survivors Insurance) is the 1st pillar of Swiss retirement. It covers basic living needs.',
    beitragDef: 'For the full AHV pension you need 44 uninterrupted contribution years. Each missing year reduces the pension.',
  });

  let result: AhvRenteOutput = $derived.by(() => {
    try {
      return calcAhvRente({ beitragsjahre: Math.max(1, Math.min(44, beitragsjahre)), durchschnittlichesEinkommen: Math.max(0, durchschnittlichesEinkommen), zivilstand });
    } catch {
      return { monatsrente: 0, jahresrente: 0, rentenSkala: 0, plafoniert: false, maxRente: 0, minRente: 0, lueckeInfo: '' };
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
  <div class="md:col-span-2 space-y-4">
    <div>
      <div class="text-sm font-medium text-[#4B5563] mb-1">
        <TermTooltip term={labels.beitragsjahre} definition={labels.beitragDef} id="term-ahv-beitrag" />: {beitragsjahre}
      </div>
      <input id="ahv-jahre" type="range" min="1" max="44" bind:value={beitragsjahre} class="w-full accent-[#1E3A8A]" />
    </div>
    <div>
      <label for="ahv-einkommen" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.einkommen}</label>
      <input id="ahv-einkommen" type="number" min="0" step="5000" bind:value={durchschnittlichesEinkommen} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none" />
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
    <div class="bg-[#059669] text-white rounded-xl p-6 mb-4">
      <div class="text-sm opacity-90"><TermTooltip term={labels.monatsrente} definition={labels.ahvDef} id="term-ahv-rente" /></div>
      <div class="text-4xl font-bold mt-1">CHF {fmtDec(result.monatsrente)}</div>
      <div class="text-sm opacity-90 mt-1">{labels.jahresrente}: CHF {fmt(result.jahresrente)}</div>
    </div>
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-xs text-[#4B5563]">{labels.plafonierung}</div>
        <div class="text-sm font-semibold text-[#1E3A8A] mt-1">{result.plafoniert ? labels.plafoniert : labels.nichtPlafoniert}</div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-xs text-[#4B5563]">{labels.luecke}</div>
        <div class="text-sm font-semibold {result.lueckeInfo ? 'text-[#DC2626]' : 'text-[#059669]'} mt-1">{result.lueckeInfo || (lang === 'de' ? 'Keine Luecke' : 'No gap')}</div>
      </div>
    </div>
  </div>
</div>
