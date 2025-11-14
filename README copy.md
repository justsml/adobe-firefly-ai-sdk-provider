# adobe-firefly-ai-sdk

Adobe Firefly provider for Vercel AI SDK v5, enabling text-to-image generation using Adobe's Firefly API.

## Installation

```bash
pnpm add adobe-firefly-ai-sdk
```

## CLI Test

```bash
bun examples/simple-firefly.ts
```

## Setup

1. Sign up for Adobe Firefly API access and obtain your Client ID and Client Secret
2. Set the environment variables:

```bash
ADOBE_FIREFLY_CLIENT_ID=your_client_id_here
ADOBE_FIREFLY_CLIENT_SECRET=your_client_secret_here
```

## Usage

### Basic Usage

```typescript
import { firefly } from 'adobe-firefly-ai-sdk';
import { experimental_generateImage as generateImage } from 'ai';

const { images } = await generateImage({
  model: firefly.image('firefly-v3'),
  prompt: 'A beautiful sunset over mountains with vibrant colors',
  n: 2,
  size: '1024x1024',
});

// images is an array of { uint8Array: Uint8Array, mimeType: string }
```

### Custom Configuration

```typescript
import { createAdobeFirefly } from 'adobe-firefly-ai-sdk';

const customFirefly = createAdobeFirefly({
  clientId: process.env.CUSTOM_ADOBE_CLIENT_ID!,
  clientSecret: process.env.CUSTOM_ADOBE_CLIENT_SECRET!,
});

const model = customFirefly.image('firefly-v3');
```

### Advanced Options

Adobe Firefly supports additional options through the model configuration:

```typescript
import { experimental_generateImage as generateImage } from 'ai';
import { firefly } from 'adobe-firefly-ai-sdk';

const { images } = await generateImage({
  model: firefly.image('firefly-v3'),
  prompt: 'A professional academic diagram of a paramecium cell',
  n: 4, // Up to 4 images per request
  size: '1024x1024', // Supports various sizes up to 2688x2688
  seed: 12345, // For reproducible results
});
```

## Supported Models

- `firefly-v3` (default) - Latest Adobe Firefly model

## Supported Sizes

Adobe Firefly supports custom dimensions from 1x1 up to 2688x2688 pixels. Common sizes include:
- `512x512`
- `1024x1024`
- `1536x1536`
- `2048x2048`
- Custom sizes like `1920x1080`, `1080x1920`, etc.

## API Features

### Image Generation Limits

- Maximum 4 images per request (`n` parameter)
- Image dimensions: 1x1 to 2688x2688 pixels
- Supports PNG format output

### Adobe Firefly Specific Features

The Adobe Firefly API supports additional advanced features that can be accessed through the underlying types:

```typescript
import type { ImageGenPayload } from 'adobe-firefly-ai-sdk';

// These features are available in the API but not exposed through
// the Vercel AI SDK interface:
// - contentClass: 'photo' | 'art'
// - visualIntensity: 2-10
// - style presets and references
// - structure references
// - negative prompts
// - tileable images
```

## Error Handling

The provider includes comprehensive error handling for common scenarios:

```typescript
try {
  const { images } = await generateImage({
    model: firefly.image('firefly-v3'),
    prompt: 'Your prompt here',
  });
} catch (error) {
  console.error('Image generation failed:', error.message);
  // Handle authentication, rate limiting, or API errors
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ADOBE_FIREFLY_CLIENT_ID` | Your Adobe Firefly Client ID | Yes |
| `ADOBE_FIREFLY_CLIENT_SECRET` | Your Adobe Firefly Client Secret | Yes |

## TypeScript Support

This package includes full TypeScript definitions and supports all Adobe Firefly API types:

```typescript
import type {
  AdobeFireflyConfig,
  ImageGenPayload,
  GenerateImageResponse
} from 'adobe-firefly-ai-sdk';
```

## License

MIT
