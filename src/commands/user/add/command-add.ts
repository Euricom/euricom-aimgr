import { createProvider, ProviderType } from '@/providers/ai-provider-factory';
import * as loading from '@/utils/loading';
import consola from 'consola';
import invariant from 'tiny-invariant';

export async function userAddCommand(email: string, options: { provider: string }) {
  try {
    loading.start('Adding user...');

    invariant(email.includes('@'), 'Invalid email format. Email must contain "@"');
    const requestedProviders = options.provider ? options.provider.split(',').map(p => p.trim() as ProviderType) : [];
    const aiProviders = requestedProviders.map(provider => createProvider(provider as ProviderType));

    // Check if the user already exists in the requestedProviders and add the user to the providers
    const addUserResults = await Promise.all(aiProviders.map(aiProvider => aiProvider.addUser(email.toLowerCase())));

    const existingProviders: string[] = [];
    const invitedProviders: string[] = [];

    // Determine which providers the user already exists in and which invites were sent
    aiProviders.forEach((aiProvider, index) => {
      if (addUserResults[index]) {
        invitedProviders.push(aiProvider.getName());
      } else {
        existingProviders.push(aiProvider.getName());
      }
    });

    // Log messages for existing users
    if (existingProviders.length > 0) {
      consola.warn(`User ${email} already exists in the following providers: ${existingProviders.join(', ')}`);
    }

    // Log messages for invites sent
    if (invitedProviders.length > 0) {
      consola.success(
        `User invited successfully for the following providers: ${invitedProviders.join(', ')}\nWaiting for invite acceptance.`
      );
    }

    // If the user exists in all providers, exit early
    if (existingProviders.length === aiProviders.length) {
      return;
    }
  } catch (error) {
    consola.error(error);
  } finally {
    loading.stop();
  }
}
