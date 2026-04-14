// SSOT — Alle Kategorien. Navigation, Homepage und Sitemap lesen hier.
export const kategorien = [
  {
    slug: 'sport-fitness',
    name_de: 'Sport & Fitness',
    name_en: 'Sport & Fitness',
    emoji: '🏃',
    desc_de: 'Für Läufer, Kraftsportler, Einsteiger und Ausdauersportler.',
    desc_en: 'For runners, gym-goers, beginners and endurance athletes.',
  },
  {
    slug: 'outdoor-abenteuer',
    name_de: 'Outdoor & Abenteuer',
    name_en: 'Outdoor & Adventure',
    emoji: '⛺',
    desc_de: 'Camping, Wandern, Klettern — alles was draussen passiert.',
    desc_en: 'Camping, hiking, climbing — everything that happens outside.',
  },
  {
    slug: 'kueche-kochen',
    name_de: 'Küche & Kochen',
    name_en: 'Kitchen & Cooking',
    emoji: '🍳',
    desc_de: 'Vom ersten Messer bis zur Profi-Pfanne.',
    desc_en: 'From your first knife to the professional pan.',
  },
  {
    slug: 'tech-creator',
    name_de: 'Tech & Creator',
    name_en: 'Tech & Creator',
    emoji: '🎙️',
    desc_de: 'Home Office, Podcast, YouTube, Streaming — dein digitales Setup.',
    desc_en: 'Home office, podcast, YouTube, streaming — your digital setup.',
  },
  {
    slug: 'leben-zuhause',
    name_de: 'Leben & Zuhause',
    name_en: 'Life & Home',
    emoji: '🏠',
    desc_de: 'Erste eigene Wohnung, Eltern werden, neuer Lebensabschnitt.',
    desc_en: 'First apartment, becoming a parent, new chapter in life.',
  },
  {
    slug: 'hobby-kreativ',
    name_de: 'Hobby & Kreativität',
    name_en: 'Hobby & Creativity',
    emoji: '🎸',
    desc_de: 'Fotografie, Musik, Handwerk — deine Leidenschaft, richtig ausgerüstet.',
    desc_en: 'Photography, music, crafts — your passion, properly equipped.',
  },
] as const;

export type KategorieSlug = (typeof kategorien)[number]['slug'];

export function findKategorie(slug: string) {
  return kategorien.find((k) => k.slug === slug);
}
