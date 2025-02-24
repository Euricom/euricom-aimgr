import { mergeUsers, User } from '@/domain/user';
import { createProvider } from '@/providers/ai-provider-factory';
import * as store from '@/store';
import { displayTable } from '@/utils/display-table';
import * as loading from '@/utils/loading';
import chalk from 'chalk';
import { consola } from 'consola';

interface ListOptions {
  filter?: string;
  sync?: boolean;
}

export async function userListCommand(options: ListOptions) {
  try {
    loading.start('Loading user list...');

    let users = store.get<User[]>('users') || [];

    // Fetch from providers if store is empty or sync is requested
    if (users.length === 0 || options.sync) {
      const aiProviders = [createProvider('openai'), createProvider('anthropic')];
      const usersFromProviders = await Promise.all(aiProviders.map(aiProvider => aiProvider.getUsers()));
      users = mergeUsers(usersFromProviders);
      store.set('users', users);
    }

    // Apply filter if specified
    if (options.filter) {
      users = users.filter(user => user.email.toLowerCase().includes(options.filter!.toLowerCase()));
    }

    // Display the user list
    consola.log(chalk.underline.cyan('\nUser List:'));
    displayTable(
      (() => {
        if (users.length > 0) {
          return users.map(user => ({
            email: user.email,
            name: user.name,
            'member of?': user.providers.map(provider => provider.name).join(', '),
          }));
        }
        return [{ email: '/', name: '/', 'member of?': '/' }];
      })()
    );
  } catch (error) {
    consola.error(error);
  } finally {
    loading.stop();
  }
}
