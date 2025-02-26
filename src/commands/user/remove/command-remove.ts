import { User } from '@/domain/user';
import { createProvider, ProviderType } from '@/providers/ai-provider-factory';
import * as store from '@/store';
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
      const requestedProviders = options.provider.split(' ').map(p => p.trim() as ProviderType);
      aiProviders = requestedProviders.map(provider => createProvider(provider as ProviderType));
    }

    const removalActions = aiProviders.map(async aiProvider => {
      loading.start(`Removing ${email} from ${aiProvider.getName()}...`);
      const foundUser = await aiProvider.getUserFromProvider(email);
      if (!foundUser) {
        consola.warn(`\n${email} is not a member of ${aiProvider.getName()}.`);
        return; // Early return for this provider
      }

      const userWorkspace = await aiProvider.getUserWorkspace(foundUser.userId, foundUser.userName);

      const isWorkspaceRemoved = userWorkspace ? await aiProvider.removeWorkspace(userWorkspace.workspaceId) : true;
      const isUserRemoved = await aiProvider.removeUser(foundUser.userId);
      if (isUserRemoved && isWorkspaceRemoved) {
        consola.success(`\n${email} was removed from ${aiProvider.getName()}.`);

        // Update the store to remove the user
        const users = store.get<User[]>('users') || [];
        const updatedUsers = users.filter(user => user.email !== email);
        store.set('users', updatedUsers);
      } else {
        consola.warn(`\nFailed to remove ${email} from ${aiProvider.getName()}.`);
      }
    });

    await Promise.all(removalActions);
  } catch (error) {
    consola.error(error);
  } finally {
    loading.stop();
  }
}
