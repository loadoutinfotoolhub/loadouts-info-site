<script>
  /**
   * LoadoutExplainer — SEO-Block in der Mitte des Inventory-Grids.
   * Enthaelt description_de als ersten sichtbaren Fliesstext auf der Page.
   */
  export let description = '';
  export let itemCount = 0;
  export let totalPrice = 0;
  export let categoryLabel = '';
  export let categoryHref = '';
  export let lang = 'de';

  const strings = {
    de: {
      heading:     'Was ist dieses Setup?',
      items:       'Items im Setup',
      total:       'Gesamt',
      categoryCta: (label) => `Alle ${label} Setups`,
    },
    en: {
      heading:     'What is this setup?',
      items:       'Items in setup',
      total:       'Total',
      categoryCta: (label) => `All ${label} setups`,
    },
  };
  $: t = strings[lang] ?? strings.de;
</script>

<section class="explainer">
  <h2>{t.heading}</h2>
  <p class="desc">{description}</p>

  <div class="stats">
    <div class="stat">
      <span class="stat-val">{itemCount}</span>
      <span class="stat-lbl">{t.items}</span>
    </div>
    <div class="stat">
      <span class="stat-val">CHF {totalPrice}</span>
      <span class="stat-lbl">{t.total}</span>
    </div>
  </div>

  {#if categoryHref && categoryLabel}
    <a class="cta" href={categoryHref}>
      <span>{t.categoryCta(categoryLabel)}</span>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
      </svg>
    </a>
  {/if}
</section>

<style>
  .explainer {
    width: 280px;
    max-width: 100%;
    padding: var(--space-5, 20px);
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-card);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .explainer h2 {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
    color: var(--text-muted);
  }
  .desc {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.88rem;
    line-height: 1.5;
  }
  .stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2);
    padding-top: 8px;
    border-top: 1px solid var(--border-subtle);
  }
  .stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .stat-val {
    font-family: var(--font-mono);
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
  }
  .stat-lbl {
    font-size: 0.72rem;
    color: var(--text-muted);
  }
  .cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    margin-top: 2px;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-btn);
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-primary);
    width: fit-content;
    transition: border-color .15s, color .15s;
  }
  .cta:hover { border-color: var(--accent); color: var(--accent); }
</style>
