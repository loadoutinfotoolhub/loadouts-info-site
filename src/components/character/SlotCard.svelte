<script>
  /**
   * SlotCard.svelte — Mini-Card im Character-Inventory.
   * Rarity-Linie 3px links, Klick öffnet SlotDetail.
   */
  export let label = '';
  /** @type {null | { id: string; name: string; price_chf: number; rarity: string; brand?: string }} */
  export let item = null;
  export let emptyText = 'Im nächsten Level';

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
    class="slot rarity-line-{item.rarity}"
    on:click={handleClick}
    on:keydown={handleKey}
    aria-label={`${label}: ${item.name}`}
  >
    <span class="slot-line" aria-hidden="true"></span>
    <span class="slot-label">{label}</span>
    <span class="slot-name">{item.name}</span>
    {#if item.brand && item.brand !== 'TBD'}
      <span class="slot-brand">{item.brand}</span>
    {/if}
    <span class="slot-price">CHF {item.price_chf}</span>
  </button>
{:else}
  <div class="slot empty" aria-label={`${label}: ${emptyText}`}>
    <span class="slot-label">{label}</span>
    <span class="slot-empty">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <span>{emptyText}</span>
    </span>
  </div>
{/if}

<style>
  .slot {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    min-width: 0;
    min-height: 96px;
    padding: var(--space-3);
    padding-left: calc(var(--space-3) + 6px);
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-btn);
    text-align: left;
    cursor: pointer;
    transition: transform .15s, border-color .15s, box-shadow .2s;
    font-family: inherit;
    color: inherit;
    overflow: hidden;
  }
  .slot:hover {
    transform: translateY(-1px);
    border-color: var(--border-default);
    box-shadow: var(--card-shadow);
  }
  .slot:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .slot.empty {
    cursor: default;
    opacity: 0.6;
    border-style: dashed;
    padding-left: var(--space-3);
  }
  .slot.empty:hover { transform: none; box-shadow: none; }
  .slot-line {
    position: absolute;
    left: 0;
    top: 8px;
    bottom: 8px;
    width: 3px;
    border-radius: 2px;
    background: var(--rarity-line-color, var(--border-strong));
  }
  .slot-label {
    font-family: var(--font-mono);
    font-size: 0.66rem;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--text-muted);
  }
  .slot-name {
    font-family: var(--font-display);
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--text-primary);
    line-height: 1.25;
  }
  .slot-brand {
    font-size: 0.7rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .slot-price {
    margin-top: auto;
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--text-secondary);
  }
  .slot-empty {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    color: var(--text-muted);
  }
</style>
