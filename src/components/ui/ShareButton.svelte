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

<button class="share" on:click={share}>
  <span>{copied ? copiedLabel : shareLabel}</span>
</button>

<style>
  .share {
    padding: 8px 14px;
    border-radius: var(--radius-btn);
    background: var(--bg-elevated);
    color: var(--text-primary);
    border: 1px solid var(--border-default);
    font-size: 0.85rem;
    cursor: pointer;
    transition: background .15s;
  }
  .share:hover { background: var(--bg-overlay); }
</style>
