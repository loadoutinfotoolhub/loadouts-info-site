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
    class="inline-flex items-center gap-0.5 border-b border-dotted border-[#1E3A8A] text-[#1E3A8A] cursor-help focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-1 rounded-sm"
    onclick={toggle}
    onkeydown={handleKeydown}
    aria-describedby={tooltipId}
    aria-expanded={open}
  >
    <span>{term}</span>
    <svg class="inline h-3.5 w-3.5 text-[#4B5563] opacity-60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
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
