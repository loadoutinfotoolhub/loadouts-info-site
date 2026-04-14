import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const rarityEnum = z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary', 'artifact']);

const itemSchema = z.object({
  id:               z.string(),
  name_de:          z.string(),
  name_en:          z.string(),
  brand:            z.string(),
  rarity:           rarityEnum,
  price_chf:        z.number(),
  go_slug:          z.string(),
  target_url:       z.string().url(),
  equipment_slot:   z.string().optional(),
  stats: z
    .object({
      qualitaet:      z.number().min(1).max(5).optional(),
      komfort:        z.number().min(1).max(5).optional(),
      haltbarkeit:    z.number().min(1).max(5).optional(),
      gewicht:        z.number().min(1).max(5).optional(),
      preis_leistung: z.number().min(1).max(5).optional(),
    })
    .optional(),
  pros_de:          z.array(z.string()).max(3),
  cons_de:          z.array(z.string()).max(2),
  pros_en:          z.array(z.string()).max(3),
  cons_en:          z.array(z.string()).max(2),
  begruendung_de:   z.string().max(300),
  begruendung_en:   z.string().max(300),
  ist_neu_in_tier:  z.boolean().default(false),
  werbung:          z.boolean().default(false),
});

const loadoutSchema = z.object({
  slug:               z.string(),
  tier:               z.enum(['beginner', 'intermediate', 'expert', 'celebrity']),
  kategorie_slug:     z.string(),
  name_de:            z.string(),
  name_en:            z.string(),
  description_de:     z.string().max(500),
  description_en:     z.string().max(500),
  social_proof:       z.number(),
  equipment_slots:    z.record(z.string(), z.string()).optional(),
  hat_character_view: z.boolean().default(false),
  items:              z.array(itemSchema).min(4).max(18),
  seo: z.object({
    title_de:  z.string().max(60),
    title_en:  z.string().max(60),
    desc_de:   z.string().max(155),
    desc_en:   z.string().max(155),
    keywords:  z.array(z.string()),
  }),
  related_slugs:      z.array(z.string()).max(3),
  published:          z.boolean().default(true),
  created_at:         z.string(),
});

export const collections = {
  loadouts: defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/loadouts' }),
    schema: loadoutSchema,
  }),
};

export type LoadoutItem = z.infer<typeof itemSchema>;
export type Loadout = z.infer<typeof loadoutSchema>;
