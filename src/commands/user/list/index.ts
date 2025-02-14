import consola from 'consola';
import { AIProvider, User } from '../../../providers/ai-provider';
import { createProvider } from '../../../providers/ai-provider-factory';
import { LoadingService } from '../../../services/loading-service';
import { displayTable } from './display-list';

export const listAction = async (options: { filter?: string }) => {
  try {
    LoadingService.start('Loading users...');

    const aiProviders: AIProvider[] = [];
    aiProviders.push(createProvider('openai'));
    aiProviders.push(createProvider('anthropic'));

    const users = await Promise.all(aiProviders.map(aiProvider => aiProvider.fetchUsers()));
    const allUsers = users.flat();

    // merge duplicate users from different providers
    const mergedUsers = mergeUsers(allUsers);

    // filter users by email if option is provided
    let filteredUsers = mergedUsers;
    if (options.filter) {
      filteredUsers = mergedUsers.filter(user => user.email.includes(options.filter!));
    }

    LoadingService.stop();

    displayTable(
      ['Email', 'Name', 'Providers'],
      filteredUsers.map(user => [
        user.email,
        user.name,
        `(${user.providers.length}) ${user.providers.map(p => p.name).join(', ')}`,
      ])
    );

    //TODO: save to file for backup, save mergedUsers
  } catch (error) {
    LoadingService.stop();
    consola.error('Failed to fetch users:', error);
  }
};

function mergeUsers(users: User[]): User[] {
  const mergedUsers: User[] = [];

  users.forEach(user => {
    const existingUser = mergedUsers.find(u => u.email === user.email);
    if (existingUser) {
      existingUser.providers.push(...user.providers);
    } else {
      mergedUsers.push(user);
    }
  });

  return mergedUsers;
}
