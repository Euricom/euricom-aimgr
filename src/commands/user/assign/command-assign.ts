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
      const requestedProviders = options.provider.split(' ').map(p => p.trim() as ProviderType);
      aiProviders = requestedProviders.map(provider => createProvider(provider as ProviderType));
    }

    // loop through all the requested providers and check if the user exists in the provider
    const assignActions = aiProviders.map(async aiProvider => {
      loading.start(`Assigning user to ${aiProvider.getName()}...`);
      const foundUser = await aiProvider.getUserFromProvider(email);
      if (!foundUser) {
        consola.warn(`\n${email} is not a member of ${aiProvider.getName()}.`);
        return;
      }

      // check if the user is already assigned to the provider (it already has a workspace or project)
      const userWorkspace = await aiProvider.getUserWorkspace(foundUser.userId, foundUser.userName);
      if (userWorkspace) {
        consola.warn(`\n${email} is already assigned to ${aiProvider.getName()}.`);
        return;
      }

      // assign the user to the provider
      const isUserAssigned = await aiProvider.assignUserToWorkspace(foundUser.userId, foundUser.userName);
      if (isUserAssigned) {
        consola.success(`\n${email} was assigned to ${aiProvider.getName()}.`);
      } else {
        consola.warn(`\nFailed to assign ${email} to ${aiProvider.getName()}.`);
      }
    });

    await Promise.all(assignActions);
  } catch (error) {
    consola.error(error);
  } finally {
    loading.stop();
  }
}
