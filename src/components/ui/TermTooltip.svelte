<script lang="ts">
  /**
   * TermTooltip: Erklärt Fachbegriffe für Laien via Tooltip/Popover.
   * Desktop: Hover öffnet Tooltip. Mobile: Tap öffnet Popover.
   * A11y: aria-describedby für Screen-Reader.
   */

  interface Props {
    term: string;
    definition: string;
    id?: string;
  }

  let { term, definition, id = '' }: Props = $props();

  const tooltipId = $derived(id || `term-${term.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`);
  let open = $state(false);

  function toggle() {
    open = !open;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') open = false;
  }
</script>

<span
  class="term-tooltip-wrapper relative inline"
  onmouseenter={() => open = true}
  onmouseleave={() => open = false}
>
  <button
    type="button"
    class="term-tooltip-btn inline-flex items-center gap-0.5 border-b border-dotted border-[#1E3A8A]/40 text-[#1E3A8A] cursor-help focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-1 rounded-sm"
    onclick={toggle}
    onkeydown={handleKeydown}
    aria-describedby={tooltipId}
    aria-expanded={open}
  >
    <span>{term}</span>
    <svg class="term-tooltip-icon shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />
    </svg>
  </button>

  {#if open}
    <div
      id={tooltipId}
      role="tooltip"
      class="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 max-w-[90vw] rounded-lg bg-white border border-gray-200 shadow-lg p-3 text-sm text-[#4B5563] leading-relaxed"
    >
      <div class="font-semibold text-[#1E3A8A] mb-1">{term}</div>
      <div>{definition}</div>
      <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
        <svg class="h-2 w-4 text-white drop-shadow-sm" viewBox="0 0 16 8" fill="currentColor">
          <path d="M0 0L8 8L16 0H0Z" />
        </svg>
      </div>
    </div>
  {/if}
</span>

<style>
  .term-tooltip-icon {
    width: 0.875em;
    height: 0.875em;
    margin-left: 1px;
    vertical-align: -0.1em;
    color: #6B7280;
    transition: color 0.15s ease;
  }

  .term-tooltip-btn:hover .term-tooltip-icon,
  .term-tooltip-btn:focus .term-tooltip-icon {
    color: #1E3A8A;
  }

  /* 44px minimum touch target on mobile via invisible padding */
  @media (pointer: coarse) {
    .term-tooltip-btn {
      position: relative;
    }
    .term-tooltip-btn::after {
      content: '';
      position: absolute;
      inset: -10px -6px;
      min-width: 44px;
      min-height: 44px;
    }
  }
</style>
