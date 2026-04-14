<script>
  /**
   * CharacterInventory.svelte — Inventory-Layout v2.
   * 3-Spalten-Grid: links 3 Slots | Mitte (kopf + SEO + overflow-leer) | rechts 3 Slots.
   */
  import SlotCard from './SlotCard.svelte';
  import SlotDetail from './SlotDetail.svelte';
  import LoadoutExplainer from '@/components/ui/LoadoutExplainer.svelte';
  import { slotIcons, slotLabels } from '@/data/slotIcons';

  /** @type {any[]} */
  export let items = [];
  /** @type {Record<string, string>} */
  export let equipmentSlots = {};
  export let lang = 'de';
  export let emptyText = 'Im nächsten Level';
  export let closeLabel = 'Schliessen';
  export let shopLabel = 'Shop';
  export let adLabel = 'Werbung';

  export let description = '';
  export let itemCount = 0;
  export let totalPrice = 0;
  export let categoryLabel = '';
  export let categoryHref = '';

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
      desc: lang === 'de' ? item.begruendung_de : item.begruendung_en,
      werbung: item.werbung,
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

  // Linke Spalte: schuhe, guertel_tasche, extra_1
  // Rechte Spalte: oberteil, hose, accessoire
  const leftSlots = ['schuhe', 'gürtel_tasche', 'extra_1'];
  const rightSlots = ['oberteil', 'hose', 'accessoire'];
</script>

<div class="inv">
  <div class="inv-grid">
    <div class="inv-col inv-left">
      {#each leftSlots as slot}
        <SlotCard
          label={slotLabels[slot]?.[lang] ?? slot}
          slot={slot}
          iconClass={slotIcons[slot] ?? 'ph-package'}
          item={asCardItem(itemFor(slot))}
          {emptyText}
          {shopLabel}
          {adLabel}
          onSelect={open}
        />
      {/each}
    </div>

    <div class="inv-col inv-center">
      <div class="inv-head">
        <SlotCard
          label={slotLabels.kopf[lang]}
          slot="kopf"
          iconClass={slotIcons.kopf}
          item={asCardItem(itemFor('kopf'))}
          {emptyText}
          {shopLabel}
          {adLabel}
          onSelect={open}
        />
      </div>

      <div class="inv-middle">
        <LoadoutExplainer
          description={description}
          itemCount={itemCount}
          totalPrice={totalPrice}
          categoryLabel={categoryLabel}
          categoryHref={categoryHref}
          {lang}
        />
      </div>
    </div>

    <div class="inv-col inv-right">
      {#each rightSlots as slot}
        <SlotCard
          label={slotLabels[slot]?.[lang] ?? slot}
          slot={slot}
          iconClass={slotIcons[slot] ?? 'ph-package'}
          item={asCardItem(itemFor(slot))}
          {emptyText}
          {shopLabel}
          {adLabel}
          onSelect={open}
        />
      {/each}
    </div>
  </div>
</div>

<SlotDetail item={selected} {lang} {closeLabel} onClose={close} />

<style>
  .inv {
    padding: var(--space-6) 0;
  }
  .inv-grid {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: var(--space-8);
    justify-content: center;
    align-items: start;
  }
  .inv-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }
  .inv-left  { align-items: flex-end; }
  .inv-right { align-items: flex-start; }
  .inv-center {
    align-items: center;
    min-width: 260px;
  }
  .inv-head {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .inv-middle {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: var(--space-2) 0;
  }

  @media (max-width: 1080px) {
    .inv-grid {
      grid-template-columns: 1fr 1fr;
      gap: var(--space-6);
    }
    .inv-left, .inv-right {
      align-items: center;
    }
    .inv-center {
      grid-column: 1 / -1;
      order: -1;
    }
  }
</style>
