import { mergeUsers, User } from '@/domain/user';
import { createProvider } from '@/providers/ai-provider-factory';
import { store } from '@/store';
import { displayTable } from '@/utils/display-table';
import * as loading from '@/utils/loading';

import consola from 'consola';

export async function listAction(options: { filter?: string }) {
  try {
    loading.start('Loading user list...');

    let users = store.get<User[]>('users') || [];

    if (users.length === 0) {
      const aiProviders = [createProvider('openai'), createProvider('anthropic')];
      const usersFromProviders = await Promise.all(aiProviders.map(aiProvider => aiProvider.fetchUsers()));
      users = mergeUsers(usersFromProviders);
      store.set<User[]>('users', users);
    }

    if (options.filter) {
      users = users.filter(user => user.email.includes(options.filter!));
    }

    consola.log('');
    displayTable(
      users.map(user => ({
        ...user,
        providers: user.providers.map(p => p.name).join(', '),
      }))
    );
  } catch (error) {
    consola.error('Failed to fetch users:', error);
  } finally {
    loading.stop();
  }
}
