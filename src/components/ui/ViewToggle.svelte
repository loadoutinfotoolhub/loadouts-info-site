<script>
  /** @type {string} */
  export let gridLabel = 'Grid-Ansicht';
  /** @type {string} */
  export let equipmentLabel = 'Equipment-Ansicht';
  /** @type {string} */
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

<div class="toggle" role="tablist">
  <button
    role="tab"
    aria-selected={view === 'grid'}
    class:active={view === 'grid'}
    on:click={() => set('grid')}
  >{gridLabel}</button>
  <button
    role="tab"
    aria-selected={view === 'equipment'}
    class:active={view === 'equipment'}
    on:click={() => set('equipment')}
  >{equipmentLabel}</button>
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
    padding: 6px 12px;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    font-family: inherit;
  }
  .toggle button.active {
    background: var(--accent);
    color: #fff;
  }
</style>
