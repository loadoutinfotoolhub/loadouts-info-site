<script>
  /**
   * ViewToggle — Grid vs. Equipment. Lucide-Icons inline (LayoutGrid / Layers).
   */
  export let gridLabel = 'Grid-Ansicht';
  export let equipmentLabel = 'Equipment-Ansicht';
  export let targetId = 'view-container';

  let view = 'grid';

  function set(newView) {
    view = newView;
    if (typeof document === 'undefined') return;
    const el = document.getElementById(targetId);
    if (!el) return;
    el.setAttribute('data-view', newView);
  }
</script>

<div class="toggle" role="tablist" aria-label="View">
  <button
    role="tab"
    aria-selected={view === 'grid'}
    class:active={view === 'grid'}
    on:click={() => set('grid')}
  >
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect width="7" height="7" x="3" y="3" rx="1"/>
      <rect width="7" height="7" x="14" y="3" rx="1"/>
      <rect width="7" height="7" x="14" y="14" rx="1"/>
      <rect width="7" height="7" x="3" y="14" rx="1"/>
    </svg>
    <span>{gridLabel}</span>
  </button>
  <button
    role="tab"
    aria-selected={view === 'equipment'}
    class:active={view === 'equipment'}
    on:click={() => set('equipment')}
  >
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/>
      <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/>
      <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>
    </svg>
    <span>{equipmentLabel}</span>
  </button>
</div>

<style>
  .toggle {
    display: inline-flex;
    padding: 3px;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-btn);
    gap: 2px;
  }
  .toggle button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 12px;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: 0.82rem;
    font-family: var(--font-display);
    font-weight: 500;
    letter-spacing: -0.005em;
    border-radius: 4px;
    cursor: pointer;
  }
  .toggle button.active {
    background: var(--accent);
    color: #fff;
  }
  .toggle svg { display: block; }
</style>
