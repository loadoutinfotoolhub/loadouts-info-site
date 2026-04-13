<script lang="ts">
  /**
   * SourceBox: Displays official sources for a calculator page.
   * Reactive to canton selection — shows federal + cantonal sources.
   * Mobile collapsible, Schema.org Citation markup.
   * Max 10 sources, priority: Bund > Kanton > Vorsorgestiftungen.
   */

  interface Source {
    displayName: string;
    url: string;
    legalBasis?: string;
    retrieved?: string;
  }

  interface CantonSource {
    name: string;
    url: string;
  }

  interface Props {
    federalSources: Source[];
    cantonSources?: Record<string, CantonSource[]>;
    selectedCanton?: string;
    lang?: 'de' | 'en';
  }

  let {
    federalSources,
    cantonSources = {},
    selectedCanton = $bindable(''),
    lang = 'de',
  }: Props = $props();

  const labels = $derived(lang === 'de' ? {
    title: 'Offizielle Quellen für diese Berechnung',
    federal: 'Bundesquellen',
    cantonal: 'Kantonale Quellen',
    legalBasis: 'Rechtsgrundlage',
    retrieved: 'Abgerufen',
    footer: 'Stand 2026. Werte werden 2x pro Woche gegen Quellen verifiziert.',
    showSources: 'Quellen anzeigen',
    hideSources: 'Quellen ausblenden',
  } : {
    title: 'Official sources for this calculation',
    federal: 'Federal sources',
    cantonal: 'Cantonal sources',
    legalBasis: 'Legal basis',
    retrieved: 'Retrieved',
    footer: 'As of 2026. Values are verified against sources twice a week.',
    showSources: 'Show sources',
    hideSources: 'Hide sources',
  });

  let expanded = $state(false);

  const activeCantonal = $derived(
    selectedCanton && cantonSources[selectedCanton]
      ? cantonSources[selectedCanton]
      : []
  );

  const allSources = $derived([
    ...federalSources.slice(0, 7),
    ...activeCantonal.slice(0, 3),
  ].slice(0, 10));

  const schemaOrgCitations = $derived(allSources.map(s => ({
    '@type': 'CreativeWork',
    name: s.displayName ?? s.name,
    url: s.url,
    ...(('retrieved' in s && s.retrieved) ? { datePublished: s.retrieved } : {}),
  })));
</script>

<section
  class="mt-8 rounded-lg border border-gray-200 bg-white"
  aria-label={labels.title}
>
  <!-- Mobile toggle -->
  <button
    class="flex w-full items-center justify-between p-4 text-left md:hidden"
    onclick={() => expanded = !expanded}
    aria-expanded={expanded}
  >
    <h3 class="text-base font-semibold text-[#1E3A8A]">{labels.title}</h3>
    <svg
      class="h-5 w-5 text-[#4B5563] transition-transform {expanded ? 'rotate-180' : ''}"
      fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  <!-- Desktop always visible, mobile collapsible -->
  <div class="hidden md:block p-4">
    <h3 class="text-base font-semibold text-[#1E3A8A] mb-3">{labels.title}</h3>
  </div>

  <div class="{expanded ? 'block' : 'hidden'} md:block px-4 pb-4">
    <!-- Federal sources -->
    {#if federalSources.length > 0}
      <h4 class="text-sm font-medium text-[#4B5563] mb-2">{labels.federal}</h4>
      <ul class="space-y-2 mb-4">
        {#each federalSources.slice(0, 7) as source}
          <li class="flex flex-col text-sm">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              class="text-[#1E3A8A] hover:underline font-medium"
            >
              {source.displayName}
            </a>
            {#if source.legalBasis}
              <span class="text-xs text-[#4B5563]">{labels.legalBasis}: {source.legalBasis}</span>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}

    <!-- Cantonal sources -->
    {#if activeCantonal.length > 0}
      <h4 class="text-sm font-medium text-[#4B5563] mb-2">{labels.cantonal}</h4>
      <ul class="space-y-2 mb-4">
        {#each activeCantonal.slice(0, 3) as source}
          <li class="text-sm">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              class="text-[#1E3A8A] hover:underline font-medium"
            >
              {source.name}
            </a>
          </li>
        {/each}
      </ul>
    {/if}

    <!-- Footer -->
    <p class="text-xs text-[#4B5563] border-t border-gray-100 pt-3 mt-3">
      {labels.footer}
    </p>
  </div>
</section>

<!-- Schema.org Citation markup (invisible, SEO only) -->
{@html `<script type="application/ld+json">${JSON.stringify(schemaOrgCitations)}<\/script>`}
