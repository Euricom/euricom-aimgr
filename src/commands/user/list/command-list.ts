import { mergeUsers } from '@/domain/user';
import { createProvider } from '@/providers/ai-provider-factory';
import { displayTable } from '@/utils/display-table';
import * as loading from '@/utils/loading';
import consola from 'consola';

export async function listAction(options: { filter?: string }) {
  try {
    loading.start('Loading user list...');

    const aiProviders = [createProvider('openai'), createProvider('anthropic')];

    const usersFromProviders = await Promise.all(aiProviders.map(aiProvider => aiProvider.fetchUsers()));

    // merge duplicate users from different providers
    let users = mergeUsers(usersFromProviders);

    // filter users by email if option is provided
    if (options.filter) {
      users = users.filter(user => user.email.includes(options.filter!));
    }

    // Add empty line before the table
    consola.log('');

    displayTable(
      users.map(user => ({
        ...user,
        providers: user.providers.map(p => p.name).join(', '),
      }))
    );

    //TODO: save to file for backup, save mergedUsers
  } catch (error) {
    consola.error('Failed to fetch users:', error);
  } finally {
    loading.stop();
  }
}
