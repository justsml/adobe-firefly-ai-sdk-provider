import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdobeFireflyImageModel } from './firefly-image-model';
import { createAdobeFirefly, firefly } from './firefly-provider';

describe('AdobeFireflyProvider', () => {
  const mockConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAdobeFirefly', () => {
    it('should create a provider instance with the given config', () => {
      const provider = createAdobeFirefly(mockConfig);
      expect(provider).toBeDefined();
    });

    it('should create image models with correct configuration', () => {
      const provider = createAdobeFirefly(mockConfig);
      const imageModel = provider.image('firefly-v3');

      expect(imageModel).toBeInstanceOf(AdobeFireflyImageModel);
      expect(imageModel.modelId).toBe('firefly-v3');
      expect(imageModel.provider).toBe('adobe-firefly');
      expect(imageModel.specificationVersion).toBe('v2');
    });

    it('should use default model ID when none provided', () => {
      const provider = createAdobeFirefly(mockConfig);
      const imageModel = provider.image();

      expect(imageModel.modelId).toBe('firefly-v3');
    });
  });

  describe('default firefly instance', () => {
    it('should create a default instance', () => {
      expect(firefly).toBeDefined();
    });

    it('should create image models from default instance', () => {
      const imageModel = firefly.image('firefly-v3');
      expect(imageModel).toBeInstanceOf(AdobeFireflyImageModel);
    });
  });
});
