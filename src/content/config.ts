import { defineCollection, z } from 'astro:content';

const services = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
    order: z.number(),
    featured: z.boolean().default(false),
  }),
});

const certifications = defineCollection({
  schema: z.object({
    title: z.string(),
    institution: z.string(),
    year: z.number(),
    description: z.string().optional(),
    order: z.number(),
  }),
});

export const collections = { services, certifications };
