import consola from 'consola';
// import { AIProvider, User } from '../../../providers/ai-provider';
import { createProvider } from '../../../providers/ai-provider-factory';
// import { LoadingService } from '../../../services/loading-service';
import { displayTable } from '../../../utils/display-table';
import * as loading from '@/utils/loading';
import { mergeUsers } from '@/domain/user';

export const listAction = async (options: { filter?: string }) => {
  try {
    loading.start('Loading users...');

    const aiProviders = [createProvider('openai'), createProvider('anthropic')];

    const usersFromProviders = await Promise.all(aiProviders.map(aiProvider => aiProvider.fetchUsers()));

    // merge duplicate users from different providers
    let users = mergeUsers(usersFromProviders);

    // filter users by email if option is provided
    if (options.filter) {
      users = users.filter(user => user.email.includes(options.filter!));
    }

    // TODO: simplify api
    displayTable(
      ['Email', 'Name', 'Providers'],
      users.map(user => [
        user.email,
        user.name,
        `(${user.providers.length}) ${user.providers.map(p => p.name).join(', ')}`,
      ])
    );

    // displayTable(
    //   ['Email', 'Name', 'Providers'],
    //   filteredUsers.map(user => {
    //     return {
    //       ...user,
    //       providers: user.providers.map(p => p.name).join(', '),
    //     };
    //   })
    // );

    //TODO: save to file for backup, save mergedUsers
  } catch (error) {
    consola.error('Failed to fetch users:', error);
  } finally {
    loading.stop();
  }
};
