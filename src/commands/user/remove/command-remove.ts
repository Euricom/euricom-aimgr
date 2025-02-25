import { createProvider, ProviderType } from '@/providers/ai-provider-factory';
import * as loading from '@/utils/loading';
import consola from 'consola';
import invariant from 'tiny-invariant';

export async function userRemoveCommand(email: string, options: { provider?: string }) {
  try {
    invariant(email.includes('@'), 'Invalid email format. Email must contain "@"');
    // get all the supported providers
    let aiProviders = [createProvider('anthropic'), createProvider('openai')];

    // If provider is provided, filter the aiProviders array
    if (options.provider) {
      const requestedProviders = options.provider.split(',').map(p => p.trim() as ProviderType);
      aiProviders = requestedProviders.map(provider => createProvider(provider as ProviderType));
    }

    // Ensure aiProviders is not empty
    if (aiProviders.length === 0) {
      consola.warn(`No valid providers specified.`);
      return; // Early return if no providers are available
    }

    for (const aiProvider of aiProviders) {
      loading.start(`Removing user ${email} from ${aiProvider.getName()}...`);
      const userMember = await aiProvider.getMemberFromProvider(email);
      if (!userMember) {
        consola.warn(`\nUser ${email} is not a member of ${aiProvider.getName()}.`);
        continue;
      }

      const removalSuccess = await aiProvider.removeUser(userMember.userId, userMember.userName);
      if (removalSuccess) {
        consola.success(`\nUser ${email} was removed from ${aiProvider.getName()}.`);
      } else {
        consola.warn(`\nFailed to remove user ${email} from ${aiProvider.getName()}.`);
      }
    }
  } catch (error) {
    consola.error(error);
  } finally {
    loading.stop();
  }
}
