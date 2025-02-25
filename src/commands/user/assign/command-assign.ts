import { createProvider, ProviderType } from '@/providers/ai-provider-factory';
import * as loading from '@/utils/loading';
import consola from 'consola';
import invariant from 'tiny-invariant';

export async function userAssignCommand(email: string, options: { provider: string }) {
  try {
    invariant(email.includes('@'), 'Invalid email format. Email must contain "@"');
    const requestedProviders = options.provider ? options.provider.split(',').map(p => p.trim() as ProviderType) : [];
    const aiProviders = requestedProviders.map(provider => createProvider(provider as ProviderType));

    // loop through all the requested providers and check if the user exists in the provider
    const assignedProviders: string[] = [];
    for (const aiProvider of aiProviders) {
      loading.start(`Assigning user to ${aiProvider.getName()}...`);
      const userMember = await aiProvider.getMemberFromProvider(email);
      if (!userMember) {
        consola.warn(`\nUser ${email} is not a member of ${aiProvider.getName()}.`);
        continue;
      }

      // check if the user is already assigned to the provider (it already has a workspace or project)
      const isUserAssigned = await aiProvider.isUserAssignedToProvider(userMember.userId, userMember.userName);
      if (isUserAssigned) {
        consola.warn(`\nUser ${email} is already assigned to ${aiProvider.getName()}.`);
        continue;
      }

      // assign the user to the provider (creates a workspace (if anthropic) or project (if openai))
      const assignResult = await aiProvider.assignUser(userMember.userId, userMember.userName);
      if (assignResult) {
        assignedProviders.push(aiProvider.getName());
      } else {
        consola.warn(`\nFailed to assign user ${email} to ${aiProvider.getName()}.`);
      }
    }

    if (assignedProviders.length > 0) {
      consola.success(`\nUser ${email} was assigned to: ${assignedProviders.join(', ')}`);
    }
  } catch (error) {
    consola.error(error);
  } finally {
    loading.stop();
  }
}
