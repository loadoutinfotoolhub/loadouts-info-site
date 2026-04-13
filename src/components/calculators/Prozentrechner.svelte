<script lang="ts">
  import { calcProzent, type ProzentrechnerOutput, type Modus } from '../../lib/calculators/prozentrechner';

  interface Props { lang?: 'de' | 'en'; }
  let { lang = 'de' }: Props = $props();

  let modus = $state<Modus>('prozentVon');
  let wert1 = $state(20);
  let wert2 = $state(500);

  const labels = $derived(lang === 'de' ? {
    modus: 'Berechnungsart',
    prozentVon: 'X% von Y berechnen',
    prozentAnteil: 'X ist wieviel % von Y?',
    prozentAenderung: 'Aenderung von X zu Y in %',
    wert1Label: modus === 'prozentVon' ? 'Prozent (%)' : modus === 'prozentAnteil' ? 'Wert' : 'Alter Wert',
    wert2Label: modus === 'prozentVon' ? 'Grundwert' : modus === 'prozentAnteil' ? 'Grundwert (100%)' : 'Neuer Wert',
    ergebnis: 'Ergebnis',
  } : {
    modus: 'Calculation type',
    prozentVon: 'Calculate X% of Y',
    prozentAnteil: 'X is what % of Y?',
    prozentAenderung: 'Change from X to Y in %',
    wert1Label: modus === 'prozentVon' ? 'Percent (%)' : modus === 'prozentAnteil' ? 'Value' : 'Old value',
    wert2Label: modus === 'prozentVon' ? 'Base value' : modus === 'prozentAnteil' ? 'Base value (100%)' : 'New value',
    ergebnis: 'Result',
  });

  let result: ProzentrechnerOutput = $derived.by(() => {
    try {
      return calcProzent({ modus, wert1, wert2 });
    } catch {
      return { ergebnis: 0, beschreibung: '' };
    }
  });

  function fmtResult(n: number): string {
    return new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  }
</script>

<div class="grid md:grid-cols-5 gap-8">
  <div class="md:col-span-2 space-y-4">
    <div>
      <label for="pct-modus" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.modus}</label>
      <select id="pct-modus" bind:value={modus} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none">
        <option value="prozentVon">{labels.prozentVon}</option>
        <option value="prozentAnteil">{labels.prozentAnteil}</option>
        <option value="prozentAenderung">{labels.prozentAenderung}</option>
      </select>
    </div>
    <div>
      <label for="pct-wert1" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.wert1Label}</label>
      <input id="pct-wert1" type="number" step="any" bind:value={wert1} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none" />
    </div>
    <div>
      <label for="pct-wert2" class="block text-sm font-medium text-[#4B5563] mb-1">{labels.wert2Label}</label>
      <input id="pct-wert2" type="number" step="any" bind:value={wert2} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none" />
    </div>
  </div>

  <div class="md:col-span-3">
    <div class="bg-[#059669] text-white rounded-xl p-6 mb-4">
      <div class="text-sm opacity-90">{labels.ergebnis}</div>
      <div class="text-4xl font-bold mt-1">{fmtResult(result.ergebnis)}{modus !== 'prozentVon' ? '%' : ''}</div>
    </div>
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="text-sm text-[#4B5563]">{result.beschreibung}</div>
    </div>
  </div>
</div>
