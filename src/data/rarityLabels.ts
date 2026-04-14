// SSOT — User-facing Preis-Labels pro Rarity. Nie Rarity-Namen im UI.
export const rarityLabels = {
  de: {
    common:    'Günstig',
    uncommon:  'Solide',
    rare:      'Empfohlen',
    epic:      'Premium',
    legendary: 'High-End',
    artifact:  'Pro-Setup',
  },
  en: {
    common:    'Budget',
    uncommon:  'Good Value',
    rare:      'Recommended',
    epic:      'Premium',
    legendary: 'High-End',
    artifact:  'Pro Setup',
  },
} as const;

export type Rarity = keyof typeof rarityLabels.de;
export type Lang = keyof typeof rarityLabels;
