import { User } from '@/domain/user';
import { createProvider, ProviderType } from '@/providers/ai-provider-factory';
import * as store from '@/store';
import { handleError } from '@/utils/error-handling';
import * as loading from '@/utils/loading';
import invariant from 'tiny-invariant';

export async function userRemoveCommand(email: string, options: { provider?: string }) {
  try {
    invariant(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      'Invalid email format. Email must contain "@" and a valid domain.'
    );
    let aiProviders = [createProvider('anthropic'), createProvider('openai')];

    if (options.provider) {
      const requestedProviders = options.provider.split(',').map(p => p.trim() as ProviderType);
      aiProviders = requestedProviders.map(provider => createProvider(provider as ProviderType));
    }

    await Promise.all(
      aiProviders.map(async aiProvider => {
        try {
          loading.start(`Removing ${email} from ${aiProvider.getName()}...`);
          const foundUser = await aiProvider.getUserFromProvider(email);

          if (!foundUser) {
            loading.warn(`${email} is not a member of ${aiProvider.getName()}.`);
            const pendingInvite = await aiProvider.getUserPendingInvite(email);
            if (!pendingInvite) return;
            const isInviteRemoved = await aiProvider.removeInvite(pendingInvite.id);
            if (!isInviteRemoved) {
              loading.fail(`Failed to remove pending invite for ${email} from ${aiProvider.getName()}.`);
            }
            loading.succeed(`Removed pending invite for ${email} from ${aiProvider.getName()}.`);
            return;
          }

          const userWorkspace = await aiProvider.getUserWorkspace(foundUser.userId, foundUser.userName);
          const isWorkspaceRemoved = userWorkspace ? await aiProvider.removeWorkspace(userWorkspace.workspaceId) : true;
          const isUserRemoved = await aiProvider.removeUser(foundUser.userId);

          if (isUserRemoved && isWorkspaceRemoved) {
            loading.succeed(`Removed ${email} from ${aiProvider.getName()}.`);
            const users = store.get<User[]>('users') || [];
            const updatedUsers = users.filter(user => user.email !== email);
            store.set('users', updatedUsers);
          } else {
            loading.fail(`Failed to remove ${email} from ${aiProvider.getName()}.`);
          }
        } finally {
          loading.stop();
        }
      })
    );
  } catch (error) {
    handleError(error);
  }
}
