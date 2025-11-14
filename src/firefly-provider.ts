import type { ImageModelV2 } from "@ai-sdk/provider";
import { AdobeFireflyImageModel } from "./firefly-image-model";
import type { AdobeFireflyConfig } from "./types";

export class AdobeFireflyProvider {
	constructor(private readonly config: AdobeFireflyConfig) {}

	/**
	 * Creates an Adobe Firefly image model for the specified model ID.
	 *
	 * @param modelId - The Adobe Firefly model ID (e.g., 'firefly-v3')
	 * @returns An Adobe Firefly image model instance compatible with Vercel AI SDK
	 *
	 * @example
	 * ```typescript
	 * const firefly = new AdobeFireflyProvider({
	 *   clientId: process.env.ADOBE_FIREFLY_CLIENT_ID!,
	 *   clientSecret: process.env.ADOBE_FIREFLY_CLIENT_SECRET!,
	 * });
	 *
	 * const model = firefly.image('firefly-v3');
	 * ```
	 */
	image(modelId = "firefly-v3"): ImageModelV2 {
		return new AdobeFireflyImageModel(modelId, this.config);
	}
}

/**
 * Creates a new Adobe Firefly provider instance.
 *
 * @param config - Configuration object containing clientId and clientSecret
 * @returns A new Adobe Firefly provider instance
 *
 * @example
 * ```typescript
 * import { createAdobeFirefly } from '@ai-sdk/adobe-firefly';
 *
 * const firefly = createAdobeFirefly({
 *   clientId: process.env.ADOBE_FIREFLY_CLIENT_ID!,
 *   clientSecret: process.env.ADOBE_FIREFLY_CLIENT_SECRET!,
 * });
 *
 * // Use with Vercel AI SDK
 * import { experimental_generateImage as generateImage } from 'ai';
 *
 * const { images } = await generateImage({
 *   model: firefly.image('firefly-v3'),
 *   prompt: 'A beautiful sunset over mountains',
 *   n: 2,
 *   size: '1024x1024',
 * });
 * ```
 */
export function createAdobeFirefly(
	config: AdobeFireflyConfig,
): AdobeFireflyProvider {
	return new AdobeFireflyProvider(config);
}

/**
 * Default Adobe Firefly provider instance.
 * Uses environment variables ADOBE_FIREFLY_CLIENT_ID and ADOBE_FIREFLY_CLIENT_SECRET.
 *
 * @example
 * ```typescript
 * import { firefly } from '@ai-sdk/adobe-firefly';
 *
 * const model = firefly.image('firefly-v3');
 * ```
 */
export const firefly = createAdobeFirefly({
	clientId: process.env["ADOBE_FIREFLY_CLIENT_ID"] ?? "",
	clientSecret: process.env["ADOBE_FIREFLY_CLIENT_SECRET"] ?? "",
});
