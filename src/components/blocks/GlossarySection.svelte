<script lang="ts">
  /**
   * GlossarySection: Listet alle Fachbegriffe einer Seite am Ende auf.
   * Wiederverwendbar für alle Rechner- und Pillar-Pages.
   */

  interface GlossaryEntry {
    term: string;
    definition: string;
  }

  interface Props {
    entries: GlossaryEntry[];
    lang?: 'de' | 'en';
  }

  let { entries, lang = 'de' }: Props = $props();

  const title = $derived(lang === 'de' ? 'Glossar: Fachbegriffe einfach erklärt' : 'Glossary: Terms explained');
</script>

{#if entries.length > 0}
  <section class="mt-12 rounded-lg border border-gray-200 bg-white p-6" aria-label={title}>
    <h2 class="text-xl font-semibold text-[#1E3A8A] mb-4">{title}</h2>
    <dl class="space-y-4">
      {#each entries as entry}
        <div class="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
          <dt class="font-medium text-[#1E3A8A]">{entry.term}</dt>
          <dd class="mt-1 text-sm text-[#4B5563] leading-relaxed">{entry.definition}</dd>
        </div>
      {/each}
    </dl>
  </section>
{/if}
