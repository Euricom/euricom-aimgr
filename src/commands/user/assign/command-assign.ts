import { createProvider, ProviderType } from '@/providers/ai-provider-factory';
import * as loading from '@/utils/loading';
import consola from 'consola';
import invariant from 'tiny-invariant';

interface AssignOptions {
  email: string;
  provider: string;
}

export async function userAssignCommand(options: AssignOptions) {
  try {
    loading.start('Assigning user...');
    invariant(options.email.includes('@'), 'Invalid email format. Email must contain "@"');

    // Get providers from options
    const requestedProviders = (options.provider?.split(',').filter(p => p !== '') as ProviderType[]) || [];
    const aiProviders = requestedProviders.map(provider => createProvider(provider as ProviderType));

    // Check if the user is a member of the organization in the requested providers
    for (const aiProvider of aiProviders) {
      const isUserMemberOfProvider = await aiProvider.isUserMemberOfProvider(options.email.toLowerCase());
      if (!isUserMemberOfProvider) {
        consola.error(
          `User ${options.email} is not a member of ${aiProvider.getName()}.\nPlease add the user to the organization in ${aiProvider.getName()} first.`
        );
        return;
      }
    }

    // Assign user to remaining providers
    for (const aiProvider of aiProviders) {
      const isAssigned = await aiProvider.assignUser(options.email.toLowerCase());
      if (isAssigned) {
        consola.success(`User ${options.email} successfully assigned to ${aiProvider.getName()}.`);
      }
    }
  } catch (error) {
    consola.error(error);
  } finally {
    loading.stop();
  }
}
