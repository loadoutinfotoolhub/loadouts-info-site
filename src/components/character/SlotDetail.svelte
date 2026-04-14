<script>
  /**
   * SlotDetail.svelte — Slide-in Overlay von rechts.
   * Zeigt volle Item-Details des geklickten Slots.
   * Schliessen: X-Button, Klick auf Backdrop, Escape.
   */
  import { onMount } from 'svelte';

  /** @type {any} */
  export let item = null;
  export let lang = 'de';
  export let goBase = '/go/';
  export let closeLabel = 'Schliessen';

  /** @type {() => void} */
  export let onClose = () => {};

  const statLabels = {
    qualitaet:      { de: 'Qualität',       en: 'Quality' },
    komfort:        { de: 'Komfort',        en: 'Comfort' },
    haltbarkeit:    { de: 'Haltbarkeit',    en: 'Durability' },
    gewicht:        { de: 'Gewicht',        en: 'Weight' },
    preis_leistung: { de: 'Preis-Leistung', en: 'Value' },
  };
  const ctaLabel = lang === 'de' ? 'Zum Produkt' : 'View product';

  $: name = item ? (lang === 'de' ? item.name_de : item.name_en) : '';
  $: reason = item ? (lang === 'de' ? item.begruendung_de : item.begruendung_en) : '';
  $: pros = item ? (lang === 'de' ? (item.pros_de ?? []) : (item.pros_en ?? [])) : [];
  $: cons = item ? (lang === 'de' ? (item.cons_de ?? []) : (item.cons_en ?? [])) : [];
  $: stats = item?.stats ? Object.entries(item.stats).filter(([, v]) => v !== undefined) : [];

  function handleKey(e) {
    if (e.key === 'Escape') onClose();
  }
  onMount(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  });
</script>

{#if item}
  <div class="backdrop" on:click={onClose} aria-hidden="true"></div>
  <aside class="panel rarity-line-{item.rarity}" role="dialog" aria-modal="true" aria-label={name}>
    <span class="panel-line" aria-hidden="true"></span>

    <header class="panel-head">
      <div class="panel-title">
        <h3>{name}</h3>
        {#if item.brand && item.brand !== 'TBD'}
          <span class="panel-brand">{item.brand}</span>
        {/if}
      </div>
      <button type="button" class="panel-close" on:click={onClose} aria-label={closeLabel}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
        </svg>
      </button>
    </header>

    <div class="panel-price">
      <span>CHF {item.price_chf}</span>
    </div>

    {#if reason}
      <p class="panel-reason">{reason}</p>
    {/if}

    {#if stats.length > 0}
      <div class="panel-stats">
        {#each stats as [k, v]}
          <div class="stat-row">
            <span class="stat-label">{statLabels[k]?.[lang] ?? k}</span>
            <span class="stat-track"><span class="stat-fill" style="width: {v}%"></span></span>
            <span class="stat-val">{v}</span>
          </div>
        {/each}
      </div>
    {/if}

    {#if pros.length > 0 || cons.length > 0}
      <div class="panel-pc">
        {#if pros.length > 0}
          <ul class="pc-pros">
            {#each pros as p}
              <li>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                <span>{p}</span>
              </li>
            {/each}
          </ul>
        {/if}
        {#if cons.length > 0}
          <ul class="pc-cons">
            {#each cons as c}
              <li>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
                <span>{c}</span>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}

    <footer class="panel-foot">
      <a class="panel-cta" href={`${goBase}${item.go_slug}`} rel="nofollow sponsored noopener" target="_blank">
        <span>{ctaLabel}</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        </svg>
      </a>
    </footer>
  </aside>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 80;
    animation: fade-in 0.15s ease-out;
  }
  .panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(420px, 92vw);
    background: var(--bg-surface);
    border-left: 1px solid var(--border-default);
    box-shadow: -12px 0 40px rgba(0, 0, 0, 0.25);
    z-index: 90;
    padding: var(--space-6);
    padding-left: calc(var(--space-6) + 4px);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    animation: slide-in 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .panel-line {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--rarity-line-color, var(--border-strong));
  }
  @keyframes slide-in {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .panel-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-3);
  }
  .panel-title h3 {
    margin: 0 0 4px;
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.25;
    color: var(--text-primary);
  }
  .panel-brand {
    font-size: 0.72rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .panel-close {
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-btn);
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-secondary);
    transition: color .15s, border-color .15s;
  }
  .panel-close:hover { color: var(--text-primary); border-color: var(--border-default); }

  .panel-price {
    font-family: var(--font-mono);
    font-size: 1.1rem;
    color: var(--text-primary);
  }
  .panel-reason {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.88rem;
    line-height: 1.55;
  }

  .panel-stats {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .stat-row {
    display: grid;
    grid-template-columns: 110px 1fr 30px;
    align-items: center;
    gap: var(--space-2);
    font-size: 0.78rem;
  }
  .stat-label { color: var(--text-muted); }
  .stat-track {
    height: 6px;
    background: var(--bg-overlay);
    border-radius: 3px;
    overflow: hidden;
    position: relative;
  }
  .stat-fill {
    display: block;
    height: 100%;
    background: var(--accent);
    border-radius: 3px;
  }
  .stat-val {
    font-family: var(--font-mono);
    text-align: right;
    color: var(--text-secondary);
  }

  .panel-pc {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-3);
    font-size: 0.82rem;
  }
  .panel-pc ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .panel-pc li {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    line-height: 1.4;
  }
  .pc-pros li { color: var(--success); }
  .pc-cons li { color: var(--danger); }
  .pc-pros li span, .pc-cons li span { color: var(--text-secondary); }

  .panel-foot { margin-top: auto; }
  .panel-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--accent);
    color: #fff;
    border-radius: var(--radius-btn);
    font-weight: 600;
    font-size: 0.9rem;
    text-decoration: none;
    transition: filter .15s;
  }
  .panel-cta:hover { filter: brightness(1.08); }

  @media (max-width: 520px) {
    .panel { padding: var(--space-5); padding-left: calc(var(--space-5) + 4px); }
    .stat-row { grid-template-columns: 90px 1fr 28px; }
  }
</style>
