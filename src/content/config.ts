import { defineCollection, z } from 'astro:content';
import { serviceIconNames } from '../components/service-icons';

const services = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // "servicio" = a treatment offered, "padecimiento" = a condition treated.
    category: z.enum(['servicio', 'padecimiento']),
    icon: z.enum(serviceIconNames),
    order: z.number(),
    highlights: z.array(z.string()).min(1),
    // Optional cover media (paths under /public). `image` is the photo, or the poster
    // when a `video` loop is set. Without either, the illustrated cover is used.
    image: z.string().optional(),
    video: z.string().optional(),
  }),
});

const certifications = defineCollection({
  schema: z.object({
    title: z.string(),
    institution: z.string(),
    year: z.number(),
    description: z.string().optional(),
    order: z.number(),
    // Shown in the card's expanding panel.
    topics: z.array(z.string()).default([]),
    // Cover photo, and an optional scan of the diploma/certificate shown when expanded.
    image: z.string().optional(),
    certificate: z.string().optional(),
  }),
});

export const collections = { services, certifications };
