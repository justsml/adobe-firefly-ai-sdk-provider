import type { ImageModelV2, ImageModelV2CallOptions, ImageModelV2CallWarning, ImageModelV2ProviderMetadata } from '@ai-sdk/provider';
import type { AccessTokenResponse, AdobeFireflyConfig, GenerateImageResponse, ImageGenPayload } from './types';

export interface AdobeFireflyImageModelConfig extends AdobeFireflyConfig {
  modelId: string;
}

export class AdobeFireflyImageModel implements ImageModelV2 {
  readonly specificationVersion = 'v2';
  readonly provider = 'adobe-firefly';

  constructor(
    public readonly modelId: string,
    private readonly config: AdobeFireflyConfig,
  ) {}

  get maxImagesPerCall() {
    return 4; // Adobe Firefly supports up to 4 variations per call
  }

  private async getAccessToken(): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: 'openid,AdobeID,session,additional_info,read_organizations,firefly_api,ff_apis',
    });

    const response = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Token request failed: ${response.status} – ${text}`);
    }

    const { access_token } = (await response.json()) as AccessTokenResponse;
    return access_token;
  }

  private mapSizeToFireflyFormat(size: string): { width: number; height: number } {
    const [widthStr, heightStr] = size.split('x');
    const width = Number.parseInt(widthStr, 10);
    const height = Number.parseInt(heightStr, 10);

    // Validate dimensions are within Adobe Firefly limits
    const clampedWidth = Math.max(1, Math.min(2688, width || 1024));
    const clampedHeight = Math.max(1, Math.min(2688, height || 1024));

    return { width: clampedWidth, height: clampedHeight };
  }

  async doGenerate(options: ImageModelV2CallOptions): Promise<{
    images: string[] | Uint8Array[];
    warnings: ImageModelV2CallWarning[];
    providerMetadata?: ImageModelV2ProviderMetadata;
    response: {
      timestamp: Date;
      modelId: string;
      headers: Record<string, string> | undefined;
    };
  }> {
    const { prompt, n = 1, size = '1024x1024', seed } = options;

    if (!prompt) {
      throw new Error('Prompt is required for Adobe Firefly image generation');
    }

    const accessToken = await this.getAccessToken();
    const dimensions = this.mapSizeToFireflyFormat(size);

    // Build the Adobe Firefly payload
    const payload: ImageGenPayload = {
      prompt: prompt.trim(),
      numVariations: Math.min(n, 4), // Adobe Firefly max is 4
      size: dimensions,
      seeds: seed ? [seed] : undefined,
      promptBiasingLocaleCode: 'en-US',
      tileable: false,
    };

    const response = await fetch('https://firefly-api.adobe.io/v3/images/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-api-key': this.config.clientId,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Adobe Firefly API error: ${response.status} - ${errorText}`);
    }

    const result = (await response.json()) as GenerateImageResponse;

    if (!result.outputs || result.outputs.length === 0) {
      throw new Error('No images returned from Adobe Firefly API');
    }

    // Download the images and convert to Uint8Array format expected by AI SDK
    const images = await Promise.all(
      result.outputs.map(async (output) => {
        const imageResponse = await fetch(output.image.url);
        if (!imageResponse.ok) {
          throw new Error(`Failed to download image: ${imageResponse.status}`);
        }

        const arrayBuffer = await imageResponse.arrayBuffer();
        return new Uint8Array(arrayBuffer);
      }),
    );

    return {
      images,
      warnings: [], // No warnings for successful generation
      providerMetadata: {
        'adobe-firefly': {
          jobId: result.id,
          status: result.status,
          images: result.outputs.map((output, index) => ({
            url: output.image.url,
            width: output.image.width,
            height: output.image.height,
            sizeInBytes: images[index]?.byteLength || 0,
          })),
        },
      },
      response: {
        timestamp: new Date(),
        modelId: this.modelId,
        headers: {
          'content-type': 'application/json',
        },
      },
    };
  }
}
