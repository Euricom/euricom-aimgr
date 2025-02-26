import { createProvider, ProviderType } from '@/providers/ai-provider-factory';
import * as loading from '@/utils/loading';
import consola from 'consola';
import invariant from 'tiny-invariant';

export async function userAddCommand(email: string, options: { provider?: string }) {
  try {
    invariant(email.includes('@'), 'Invalid email format. Email must contain "@"');
    let aiProviders = [createProvider('anthropic'), createProvider('openai')];

    // If provider is provided, filter the aiProviders array
    if (options.provider) {
      const requestedProviders = options.provider.split(' ').map(p => p.trim() as ProviderType);
      aiProviders = requestedProviders.map(provider => createProvider(provider as ProviderType));
    }

    const addActions = aiProviders.map(async aiProvider => {
      loading.start(`Adding ${email} to ${aiProvider.getName()}...`);
      const foundUser = await aiProvider.getUserFromProvider(email);
      if (foundUser) {
        consola.warn(`\n${email} is already a member of ${aiProvider.getName()}.`);
        return;
      }

      const pendingInvite = await aiProvider.getUserPendingInvite(email);
      if (pendingInvite) {
        consola.warn(
          `\n${email} is already invited to ${aiProvider.getName()} and waiting for acceptance since ${pendingInvite.invitedAt.toLocaleString()}`
        );
        return;
      }

      const isAdded = await aiProvider.addUser(email.toLowerCase());
      if (isAdded) {
        consola.success(`\n${email} was added to ${aiProvider.getName()} and waiting for acceptance.`);
      } else {
        consola.warn(`\nFailed to add ${email} to ${aiProvider.getName()}.`);
      }
    });

    await Promise.all(addActions);
  } catch (error) {
    consola.error(error);
  } finally {
    loading.stop();
  }
}
