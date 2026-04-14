<script>
  /**
   * CharacterInventory.svelte — Diablo-artiges Equipment-Layout.
   * Silhouette zentral, SlotCards flankierend, Overlay bei Klick.
   */
  import SlotCard from './SlotCard.svelte';
  import SlotDetail from './SlotDetail.svelte';

  /** @type {any[]} */
  export let items = [];
  /** @type {Record<string, string>} */
  export let equipmentSlots = {};
  export let lang = 'de';
  export let emptyText = 'Im nächsten Level';
  export let closeLabel = 'Schliessen';

  const slotOrder = ['kopf', 'oberteil', 'accessoire', 'gürtel_tasche', 'hose', 'schuhe'];
  const slotLabels = {
    kopf:            { de: 'Kopf',       en: 'Head' },
    oberteil:        { de: 'Oberteil',   en: 'Top' },
    hose:            { de: 'Hose',       en: 'Pants' },
    schuhe:          { de: 'Schuhe',     en: 'Shoes' },
    accessoire:      { de: 'Accessoire', en: 'Accessory' },
    'gürtel_tasche': { de: 'Gürtel',     en: 'Belt' },
  };

  function itemFor(slot) {
    const id = equipmentSlots?.[slot];
    if (!id) return null;
    return items.find((i) => i.id === id) ?? null;
  }

  function asCardItem(item) {
    if (!item) return null;
    return {
      id: item.id,
      name: lang === 'de' ? item.name_de : item.name_en,
      price_chf: item.price_chf,
      rarity: item.rarity,
      brand: item.brand,
    };
  }

  /** @type {any} */
  let selected = null;
  function open(raw) {
    selected = items.find((i) => i.id === raw.id) ?? null;
  }
  function close() {
    selected = null;
  }
</script>

<div class="inv">
  <div class="inv-grid">
    <div class="inv-slot area-kopf">
      <SlotCard label={slotLabels.kopf[lang]} item={asCardItem(itemFor('kopf'))} {emptyText} onSelect={open} />
    </div>
    <div class="inv-slot area-oberteil">
      <SlotCard label={slotLabels.oberteil[lang]} item={asCardItem(itemFor('oberteil'))} {emptyText} onSelect={open} />
    </div>
    <div class="inv-slot area-acc">
      <SlotCard label={slotLabels.accessoire[lang]} item={asCardItem(itemFor('accessoire'))} {emptyText} onSelect={open} />
    </div>
    <div class="inv-slot area-guertel">
      <SlotCard label={slotLabels['gürtel_tasche'][lang]} item={asCardItem(itemFor('gürtel_tasche'))} {emptyText} onSelect={open} />
    </div>
    <div class="inv-slot area-hose">
      <SlotCard label={slotLabels.hose[lang]} item={asCardItem(itemFor('hose'))} {emptyText} onSelect={open} />
    </div>
    <div class="inv-slot area-schuhe">
      <SlotCard label={slotLabels.schuhe[lang]} item={asCardItem(itemFor('schuhe'))} {emptyText} onSelect={open} />
    </div>

    <div class="inv-body" aria-hidden="true">
      <svg viewBox="0 0 120 260" width="160" height="340" xmlns="http://www.w3.org/2000/svg"
           fill="none"
           stroke="var(--silhouette-stroke, var(--border-default))"
           stroke-width="1.4"
           stroke-linecap="round"
           stroke-linejoin="round">
        <circle cx="60" cy="30" r="18"/>
        <path d="M52 48 L54 58 M68 48 L66 58"/>
        <path d="M40 62 Q38 62 36 66 L28 112 Q27 118 32 118 L44 118 L44 140 L76 140 L76 118 L88 118 Q93 118 92 112 L84 66 Q82 62 80 62 Z"/>
        <path d="M36 66 L24 108 Q22 118 24 126"/>
        <path d="M84 66 L96 108 Q98 118 96 126"/>
        <path d="M48 140 L46 210 Q46 216 52 216 L58 216 L58 140"/>
        <path d="M72 140 L74 210 Q74 216 68 216 L62 216 L62 140"/>
        <path d="M44 216 Q40 224 50 228 L58 228 L58 216"/>
        <path d="M76 216 Q80 224 70 228 L62 228 L62 216"/>
      </svg>
    </div>
  </div>
</div>

<SlotDetail item={selected} {lang} {closeLabel} onClose={close} />

<style>
  .inv {
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-card);
    box-shadow: var(--card-shadow);
    padding: var(--space-6);
  }
  :global([data-theme="dark"]) .inv {
    --silhouette-stroke: var(--border-strong);
  }
  .inv-grid {
    position: relative;
    display: grid;
    grid-template-columns: 160px 200px 160px;
    grid-template-rows: auto auto auto auto;
    grid-template-areas:
      ". kopf ."
      "acc body oberteil"
      "guertel body hose"
      ". body schuhe";
    gap: var(--space-3);
    justify-content: center;
    align-items: start;
  }
  .inv-body {
    grid-area: body;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: var(--space-3);
    color: var(--border-default);
  }
  .area-kopf    { grid-area: kopf; }
  .area-oberteil{ grid-area: oberteil; }
  .area-acc     { grid-area: acc; }
  .area-guertel { grid-area: guertel; }
  .area-hose    { grid-area: hose; }
  .area-schuhe  { grid-area: schuhe; }

  @media (max-width: 860px) {
    .inv-grid {
      grid-template-columns: 1fr 1fr;
      grid-template-areas:
        "kopf oberteil"
        "acc guertel"
        "hose schuhe";
    }
    .inv-body { display: none; }
  }
  @media (max-width: 480px) {
    .inv { padding: var(--space-4); }
    .inv-grid {
      grid-template-columns: 1fr;
      grid-template-areas:
        "kopf"
        "oberteil"
        "acc"
        "guertel"
        "hose"
        "schuhe";
    }
  }
</style>
