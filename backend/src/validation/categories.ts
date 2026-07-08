import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  name_en: z.string().max(100).optional(),
  slug: z.string().min(1).max(100),
  icon: z.string().max(200).optional(),
  parent_id: z.number().positive().optional().nullable(),
  sort_order: z.number().int().min(0).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createAttributeSchema = z.object({
  name: z.string().min(1).max(100),
  label: z.string().min(1).max(100),
  type: z.enum(['text', 'number', 'select', 'multi_select', 'boolean', 'range', 'color']),
  options: z.any().optional(),
  unit: z.string().max(50).optional(),
  is_required: z.boolean().optional(),
  is_filterable: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
});

export const updateAttributeSchema = createAttributeSchema.partial();

export const createProvinceSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  sort_order: z.number().int().min(0).optional(),
});

export const updateProvinceSchema = createProvinceSchema.partial();

export const createCitySchema = z.object({
  name: z.string().min(1).max(100),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateAttributeInput = z.infer<typeof createAttributeSchema>;
export type UpdateAttributeInput = z.infer<typeof updateAttributeSchema>;
export type CreateProvinceInput = z.infer<typeof createProvinceSchema>;
export type UpdateProvinceInput = z.infer<typeof updateProvinceSchema>;
export type CreateCityInput = z.infer<typeof createCitySchema>;
