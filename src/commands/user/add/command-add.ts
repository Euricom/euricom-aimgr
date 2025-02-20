import { mergeUsers, User } from '@/domain/user';
import { createProvider, ProviderType } from '@/providers/ai-provider-factory';
import * as store from '@/store';
import * as loading from '@/utils/loading';
import consola from 'consola';
import invariant from 'tiny-invariant';

interface AddOptions {
  email: string;
  provider: string;
}

export async function userCommandAddAction(options: AddOptions) {
  try {
    loading.start('Adding user...');

    invariant(options.email.includes('@'), 'Invalid email format. Email must contain "@"');

    // Get providers from options or use all available providers
    let requestedProviders: ProviderType[] =
      (options.provider?.split(',').filter(p => p !== '') as ProviderType[]) || [];

    // Check if the user already exists in all providers
    const allAiProviders = [createProvider('anthropic'), createProvider('openai')];
    let alreadyExistingProviders: string[] = [];
    for (const aiProvider of allAiProviders) {
      const isUserMemberOfProvider = await aiProvider.isUserMemberOfProvider(options.email.toLowerCase());
      if (isUserMemberOfProvider) {
        alreadyExistingProviders.push(aiProvider.getName());
      }
    }

    // If the user already exists in all providers, we can't add them
    if (alreadyExistingProviders.length === allAiProviders.length) {
      consola.error(`User ${options.email} already exists in all providers`);
      return;
    }

    // If the user already exists in some providers, we only need to add the requested provider that is not already added
    requestedProviders = requestedProviders.filter(provider => !alreadyExistingProviders.includes(provider));

    // Create the user with the requested providers
    const aiProviders = requestedProviders.map(provider => createProvider(provider as ProviderType));

    const createdUserProviders = await Promise.all(
      aiProviders.map(aiProvider => aiProvider.addUser(options.email.toLowerCase()))
    );

    const mergedUser = mergeUsers(createdUserProviders);
    const user = mergedUser[0];

    const users = store.get<User[]>('users') || [];
    const userIndex = users.findIndex(user => user.email === options.email);
    if (userIndex === -1) {
      users.push(user);
    } else {
      users[userIndex] = user;
    }
    store.set('users', users);

    consola.success(
      `User ${user.email} added successfully with the following providers: ${requestedProviders.join(', ')}`
    );
  } catch (error) {
    consola.error(error);
  } finally {
    loading.stop();
  }
}
