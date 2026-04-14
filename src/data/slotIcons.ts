// SSOT — Phosphor-Icon-Mapping fuer Equipment-Slots.
// Verwendet in SlotCard / MobileInventoryList.
// CSS-Klassen aus @phosphor-icons/web (ph-<name>).

export const slotIcons: Record<string, string> = {
  kopf:            'ph-user',
  oberteil:        'ph-t-shirt',
  hose:            'ph-pants',
  schuhe:          'ph-sneaker',
  accessoire:      'ph-watch',
  'gürtel_tasche': 'ph-circle-wavy',
  extra_1:         'ph-package',
  extra_2:         'ph-package',
  extra_3:         'ph-package',
  extra_4:         'ph-package',
};

export const slotLabels: Record<string, { de: string; en: string }> = {
  kopf:            { de: 'Kopf',       en: 'Head' },
  oberteil:        { de: 'Oberteil',   en: 'Top' },
  hose:            { de: 'Hose',       en: 'Pants' },
  schuhe:          { de: 'Schuhe',     en: 'Shoes' },
  accessoire:      { de: 'Accessoire', en: 'Accessory' },
  'gürtel_tasche': { de: 'Gürtel',     en: 'Belt' },
  extra_1:         { de: 'Extra',      en: 'Extra' },
  extra_2:         { de: 'Extra',      en: 'Extra' },
  extra_3:         { de: 'Extra',      en: 'Extra' },
  extra_4:         { de: 'Extra',      en: 'Extra' },
};

export function slotIconFor(slot?: string): string {
  if (!slot) return 'ph-package';
  return slotIcons[slot] ?? 'ph-package';
}
export function slotLabelFor(slot: string | undefined, lang: 'de' | 'en'): string {
  if (!slot) return lang === 'de' ? 'Extra' : 'Extra';
  return slotLabels[slot]?.[lang] ?? (lang === 'de' ? 'Extra' : 'Extra');
}
