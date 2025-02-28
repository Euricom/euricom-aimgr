import { createProvider, ProviderType } from '@/providers/ai-provider-factory';
import * as loading from '@/utils/loading';
import consola from 'consola';
import invariant from 'tiny-invariant';

export async function userAssignCommand(email: string, options: { provider?: string }) {
  try {
    invariant(email.includes('@'), 'Invalid email format. Email must contain "@"');

    let aiProviders = [createProvider('anthropic'), createProvider('openai')];

    // If provider is provided, filter the aiProviders array
    if (options.provider) {
      const requestedProviders = options.provider.split(',').map(p => p.trim() as ProviderType);
      aiProviders = requestedProviders.map(provider => createProvider(provider as ProviderType));
    }

    // loop through all the requested providers and check if the user exists in the provider
    await Promise.all(
      aiProviders.map(async aiProvider => {
        try {
          loading.start(`Assigning user to ${aiProvider.getName()}...`);
          const foundUser = await aiProvider.getUserFromProvider(email);
          if (!foundUser) {
            loading.warn(`${email} is not a member of ${aiProvider.getName()}.`);
            return;
          }

          // check if the user is already assigned to the provider (it already has a workspace or project)
          const userWorkspace = await aiProvider.getUserWorkspace(foundUser.userId, foundUser.userName);
          if (userWorkspace) {
            loading.warn(`${email} is already assigned to ${aiProvider.getName()}.`);
            return;
          }

          // assign the user to the provider
          const isUserAssigned = await aiProvider.assignUserToWorkspace(foundUser.userId, foundUser.userName);
          if (isUserAssigned) {
            loading.succeed(`Assigned ${email} to ${aiProvider.getName()}.`);
          } else {
            loading.fail(`Failed to assign ${email} to ${aiProvider.getName()}.`);
          }
        } catch (error) {
          consola.error(error);
        } finally {
          loading.stop();
        }
      })
    );
  } catch (error) {
    consola.error(error);
  }
}
