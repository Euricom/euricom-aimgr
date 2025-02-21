import { createProvider, ProviderType } from '@/providers/ai-provider-factory';
import * as loading from '@/utils/loading';
import consola from 'consola';
import invariant from 'tiny-invariant';

interface AddOptions {
  email: string;
  provider: string;
}

export async function userAddCommand(options: AddOptions) {
  try {
    loading.start('Adding user...');

    invariant(options.email.includes('@'), 'Invalid email format. Email must contain "@"');

    // Get providers from options or use all available providers
    const requestedProviders = (options.provider?.split(',').filter(p => p !== '') as ProviderType[]) || [];
    const aiProviders = requestedProviders.map(provider => createProvider(provider as ProviderType));

    // Check if the user already exists in all providers
    let alreadyExistingProviders: string[] = [];
    for (const aiProvider of aiProviders) {
      const isUserMemberOfProvider = await aiProvider.isUserMemberOfProvider(options.email.toLowerCase());
      if (isUserMemberOfProvider) {
        alreadyExistingProviders.push(aiProvider.getName());
      }
    }

    // If the user already exists in all providers, we can't add them
    if (alreadyExistingProviders.length === aiProviders.length) {
      consola.error(`User ${options.email} already exists in all providers`);
      return;
    }

    // If the user already exists in some providers, we only need to add the requested provider that is not already added
    const filteredProviders = requestedProviders.filter(provider => !alreadyExistingProviders.includes(provider));

    const hasUserBeenAdded = await Promise.all(
      filteredProviders.map(provider => createProvider(provider as ProviderType).addUser(options.email.toLowerCase()))
    );

    if (!hasUserBeenAdded) {
      consola.error(`User ${options.email} already exists in all providers`);
      return;
    }

    consola.success(
      `User invited successfully for the following providers: ${filteredProviders.join(', ')}\n Waiting for invite acceptance.`
    );
  } catch (error) {
    consola.error(error);
  } finally {
    loading.stop();
  }
}
