import { join } from 'path';
import { firefly } from 'adobe-firefly-ai-sdk';
import { experimental_generateImage as generateImage } from 'ai';
import { writeFile } from 'fs/promises';

/**
 * Example usage of the Adobe Firefly provider with Vercel AI SDK v5
 *
 * This example demonstrates:
 * 1. How to use the firefly provider with generateImage
 * 2. How to save generated images to disk
 * 3. How to handle multiple image variations
 */
async function main() {
  try {
    // Generate images using Adobe Firefly
    const { images, providerMetadata } = await generateImage({
      model: firefly.image('firefly-v3'),
      prompt:
        'For a 10th grade biology presentation, create a diagram of a paramecium cell with the various structures such as Ribosomes, nucleoid, plasma membrane, etc. It should look academic and professional.',
      n: 2, // Generate 2 variations
      size: '1024x1024',
      seed: 12345, // For reproducible results
    });

    console.log(`Generated ${images.length} images`);
    console.log('Provider metadata:', providerMetadata);

    // Save images to disk
    const savedPaths: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const filename = `firefly-image-${i + 1}-${Date.now()}.png`;
      const filepath = join(process.cwd(), filename);

      await writeFile(filepath, image.uint8Array);
      savedPaths.push(filepath);

      console.log(`Image ${i + 1} saved to: ${filepath}`);
      console.log(`Image ${i + 1} size: ${image.uint8Array.byteLength} bytes`);
    }

    console.log('All images saved successfully!');
    console.log('Saved paths:', savedPaths);
  } catch (error) {
    console.error('Error generating images:', error);

    if (error instanceof Error) {
      if (error.message.includes('ADOBE_FIREFLY_CLIENT_ID')) {
        console.error('Please set your ADOBE_FIREFLY_CLIENT_ID environment variable');
      } else if (error.message.includes('ADOBE_FIREFLY_CLIENT_SECRET')) {
        console.error('Please set your ADOBE_FIREFLY_CLIENT_SECRET environment variable');
      }
    }

    process.exit(1);
  }
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
