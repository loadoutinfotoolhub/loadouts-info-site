<script>
  /** @type {string} */
  export let url = '';
  /** @type {string} */
  export let title = '';
  /** @type {string} */
  export let shareLabel = 'Setup teilen';
  /** @type {string} */
  export let copiedLabel = 'Link kopiert!';

  let copied = false;

  async function share() {
    const fullUrl = url.startsWith('http') ? url : (typeof window !== 'undefined' ? window.location.href : url);
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl });
        return;
      } catch (_) { /* fall through */ }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(fullUrl);
        copied = true;
        setTimeout(() => (copied = false), 1800);
      } catch (_) { /* noop */ }
    }
  }
</script>

<button class="share" on:click={share} type="button">
  <svg class="ic" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/>
    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
  </svg>
  <span>{copied ? copiedLabel : shareLabel}</span>
</button>

<style>
  .share {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: var(--radius-btn);
    background: transparent;
    color: var(--text-primary);
    border: 1px solid var(--border-default);
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background .15s, border-color .15s;
  }
  .share:hover {
    background: var(--bg-elevated);
    border-color: var(--border-strong);
  }
  .ic { display: inline-block; }
</style>
