<script>
  /**
   * SlotCard.svelte — Inventory-Layout v2.
   * Feste 220x160. Top-Border (3px) in Rarity-Farbe.
   * Phosphor-Slot-Icon als visuelle Markierung.
   */
  export let label = '';
  export let slot = '';
  export let iconClass = 'ph-package';
  /** @type {null | { id: string; name: string; price_chf: number; rarity: string; brand?: string; desc?: string; werbung?: boolean; tierPriceLabel?: string }} */
  export let item = null;
  export let emptyText = 'Im nächsten Level';
  export let shopLabel = 'Shop';
  export let adLabel = 'Werbung';

  /** @type {(item: any) => void} */
  export let onSelect = () => {};

  function handleClick() {
    if (item) onSelect(item);
  }
  function handleKey(e) {
    if (!item) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(item);
    }
  }
</script>

{#if item}
  <button
    type="button"
    class="item-card slot rarity-line-{item.rarity}"
    style="border-top-color: var(--rarity-{item.rarity})"
    on:click={handleClick}
    on:keydown={handleKey}
    aria-label={`${label}: ${item.name}`}
  >
    <header class="slot-head">
      <i class={`ph ${iconClass}`} style="color: var(--rarity-{item.rarity})" aria-hidden="true"></i>
      <span class="slot-meta">
        <span class="slot-label">{label}</span>
        {#if item.tierPriceLabel}
          <span class="slot-dot" aria-hidden="true">·</span>
          <span class="slot-tier">{item.tierPriceLabel}</span>
        {/if}
      </span>
    </header>

    <h3 class="slot-name">{item.name}</h3>
    {#if item.desc}
      <p class="slot-desc">{item.desc}</p>
    {/if}

    <footer class="slot-foot">
      <span class="slot-price">CHF {item.price_chf}</span>
      <span class="slot-tags">
        <span class="tag-shop">{shopLabel}</span>
        {#if item.werbung}
          <span class="tag-ad">{adLabel}</span>
        {/if}
      </span>
    </footer>
  </button>
{:else}
  <div class="item-card slot empty" aria-label={`${label}: ${emptyText}`}>
    <header class="slot-head">
      <i class={`ph ${iconClass}`} aria-hidden="true"></i>
      <span class="slot-meta">
        <span class="slot-label">{label}</span>
      </span>
    </header>
    <div class="slot-empty-body">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <span>{emptyText}</span>
    </div>
  </div>
{/if}

<style>
  /* .item-card basis-dimensionen kommen aus global.css (220x160). */
  .slot {
    position: relative;
    gap: 0;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-top: 3px solid var(--rarity-line-color, var(--border-strong));
    border-radius: var(--radius-card);
    text-align: left;
    cursor: pointer;
    overflow: hidden;
    color: inherit;
    font-family: inherit;
    transition: transform .15s, border-color .15s, box-shadow .2s;
  }
  .slot:hover {
    transform: translateY(-2px);
    box-shadow: var(--card-shadow-hover);
  }
  .slot:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .slot.empty {
    cursor: default;
    border: 1px dashed var(--border-default);
    background: var(--bg-elevated);
    opacity: 0.85;
  }
  .slot.empty:hover { transform: none; box-shadow: none; }

  .slot-head {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--text-muted);
  }
  .slot-head i.ph { font-size: 15px; line-height: 1; display: inline-block; }
  .slot-meta { display: inline-flex; align-items: center; gap: 4px; }
  .slot-label { color: var(--text-secondary); }
  .slot-dot { opacity: 0.5; }
  .slot-tier { color: var(--text-muted); }

  .slot-name {
    margin: 8px 0 4px;
    font-family: var(--font-display);
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.2;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .slot-desc {
    margin: 0;
    font-size: 11px;
    line-height: 1.4;
    color: var(--text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .slot-foot {
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .slot-price {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--text-primary);
    font-weight: 600;
  }
  .slot-tags { display: inline-flex; gap: 6px; }
  .tag-shop, .tag-ad {
    font-family: var(--font-mono);
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 2px 6px;
    border-radius: 4px;
  }
  .tag-shop { background: var(--accent); color: #fff; }
  .tag-ad   { background: var(--bg-elevated); color: var(--text-muted); border: 1px solid var(--border-subtle); }

  .slot-empty-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: var(--text-muted);
    font-size: 0.78rem;
    text-align: center;
    padding: 4px 4px 2px;
  }
</style>
