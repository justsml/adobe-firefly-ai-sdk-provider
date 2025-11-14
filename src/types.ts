import { z } from 'zod';

// Adobe Firefly API schemas based on the test script
export const PublicBinaryInputSchema = z.object({
  url: z.string().url().optional(),
  uploadId: z.string().optional(),
});

export type PublicBinaryInput = z.infer<typeof PublicBinaryInputSchema>;

export const StyleSchema = z.object({
  presets: z.array(z.string()).optional(),
  strength: z.number().int().min(0).max(100).optional(),
  imageReference: PublicBinaryInputSchema.optional(),
});

export type Style = z.infer<typeof StyleSchema>;

export const StructureSchema = z.object({
  strength: z.number().int().min(0).max(100).optional(),
  imageReference: PublicBinaryInputSchema.optional(),
});

export type Structure = z.infer<typeof StructureSchema>;

export const SizeSchema = z.object({
  width: z.number().int().min(1).max(2688).default(1024),
  height: z.number().int().min(1).max(2688).default(1024),
});

export type Size = z.infer<typeof SizeSchema>;

export const ImageGenPayloadSchema = z
  .object({
    prompt: z
      .string()
      .min(1, { message: 'is prompt required' })
      .transform((s) => s.trim()),
    numVariations: z.number().int().min(1).max(4).default(1),
    seeds: z.array(z.number().int()).optional(),
    size: SizeSchema.default({}),
    negativePrompt: z.string().max(1024).optional(),
    contentClass: z.enum(['photo', 'art']).optional(),
    visualIntensity: z.number().int().min(2).max(10).optional(),
    style: StyleSchema.optional(),
    promptBiasingLocaleCode: z.string().default('en-US'),
    tileable: z.boolean().default(false),
    structure: StructureSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.seeds && data.seeds.length !== data.numVariations) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'len(seeds) match must numVariations',
        path: ['seeds'],
      });
    }
  });

export type ImageGenPayload = z.infer<typeof ImageGenPayloadSchema>;

// Adobe Firefly API response types
export interface ImageOutput {
  image: {
    url: string;
    width: number;
    height: number;
  };
}

export interface GenerateImageResponse {
  outputs: ImageOutput[];
  id: string;
  status: string;
}

export interface AdobeFireflyConfig {
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
