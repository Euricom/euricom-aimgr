import { AIProvider } from './ai-provider';
import { AnthropicProvider } from './anthropic-provider';
import { OpenAIProvider } from './openai-provider';

export type ProviderType = 'anthropic' | 'openai';

export function createProvider(providerName: ProviderType): AIProvider {
  switch (providerName) {
    case 'anthropic':
      return new AnthropicProvider();
    case 'openai':
      return new OpenAIProvider();
    default:
      throw new Error(`Provider ${providerName} not found`);
  }
}
