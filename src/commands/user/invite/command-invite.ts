import { createProvider, ProviderType } from '@/providers/ai-provider-factory';
import { handleError } from '@/utils/error-handling';
import * as loading from '@/utils/loading';
import invariant from 'tiny-invariant';

export async function userInviteCommand(email: string, options: { provider?: string }) {
  try {
    invariant(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      'Invalid email format. Email must contain "@" and a valid domain.'
    );
    let aiProviders = [createProvider('anthropic'), createProvider('openai')];

    // If provider is provided, filter the aiProviders array
    if (options.provider) {
      const requestedProviders = options.provider.split(',').map(p => p.trim() as ProviderType);
      aiProviders = requestedProviders.map(provider => createProvider(provider as ProviderType));
    }

    await Promise.all(
      aiProviders.map(async aiProvider => {
        try {
          loading.start(`Inviting ${email} to ${aiProvider.getName()}...`);
          const foundUser = await aiProvider.getUserFromProvider(email);

          if (foundUser) {
            loading.warn(`${email} is already a member of ${aiProvider.getName()}.`);
            return;
          }

          const pendingInvite = await aiProvider.getUserPendingInvite(email);
          if (pendingInvite) {
            loading.warn(
              `${email} is already invited to ${aiProvider.getName()} and waiting for acceptance since ${pendingInvite.invitedAt.toLocaleString()}`
            );
            return;
          }

          const isInvited = await aiProvider.inviteUser(email.toLowerCase());
          if (isInvited) {
            loading.succeed(`Invited ${email} to ${aiProvider.getName()} and waiting for acceptance.`);
          } else {
            loading.fail(`Failed to invite ${email} to ${aiProvider.getName()}.`);
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
