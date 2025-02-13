import consola from 'consola';
import { AnthropicProvider } from './anthropic-provider';
import { BaseProvider, UserData } from './base-provider';
import { OpenAIProvider } from './openai-provider';

export type ProviderType = 'openai' | 'anthropic';

// TODO: factory is overly complex, can be simplified

// Simple factory following Single Responsibility Principle

// TODO: don't use class when you only have static methods
export class ProviderFactory {
  private static providers = new Map<string, BaseProvider>();
  private static registry = new Map<ProviderType, new (apiKey: string) => BaseProvider>([
    ['openai', OpenAIProvider],
    ['anthropic', AnthropicProvider],
  ]);

  static registerProvider(name: ProviderType, providerClass: new (apiKey: string) => BaseProvider) {
    this.registry.set(name, providerClass);
  }

  static getProvider(name: ProviderType, apiKey: string): BaseProvider {
    const providerKey = `${name}-${apiKey}`;

    if (!this.providers.has(providerKey)) {
      const ProviderClass = this.registry.get(name);
      if (!ProviderClass) {
        throw new Error(`Unknown provider: ${name}`);
      }
      this.providers.set(providerKey, new ProviderClass(apiKey));
    }

    return this.providers.get(providerKey)!;
  }

  // TODO: not a responsibility of the factory
  static async fetchUsersFromProvider(provider: BaseProvider): Promise<UserData[]> {
    try {
      const users = await provider.fetchUsers();
      consola.info(`Fetched ${users.length} users from ${provider.getName()}`);
      return users;
    } catch (error) {
      consola.warn(`Error fetching ${provider.getName()} users:`, error);
      return [];
    }
  }

  // TODO: not a responsibility of the factory
  static getSupportedProviders(): ProviderType[] {
    return Array.from(this.registry.keys());
  }

  static getInitializedProviders(): BaseProvider[] {
    const providers: BaseProvider[] = [];

    // Map of environment variables to provider types
    const providerEnvMap = {
      OPENAI_ADMIN_KEY: 'openai',
      ANTHROPIC_ADMIN_KEY: 'anthropic',
      // Add new providers here with their env var keys
      // OPENROUTER_ADMIN_KEY: 'openrouter',
      // MISTRAL_ADMIN_KEY: 'mistral',
    } as const;

    // Initialize providers based on available environment variables
    Object.entries(providerEnvMap).forEach(([envKey, providerType]) => {
      const apiKey = process.env[envKey];
      if (apiKey) {
        const provider = this.getProvider(providerType as ProviderType, apiKey);
        if (provider) {
          providers.push(provider);
        }
      }
    });

    return providers;
  }
}
