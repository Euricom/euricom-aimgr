import Table from 'cli-table3';
import { consola } from 'consola';
import pc from 'picocolors';
import { UserData } from '../providers/base-provider';

export class DisplayService {
  static displayUserInfo(userData: UserData) {
    consola.info(`User Information for ${pc.blue(userData.email)}`);
    consola.info(`Name: ${pc.green(userData.name)}`);

    const table = new Table({
      head: ['Provider', 'Credits Limit', 'Credits Used', 'API Keys'],
      style: {
        head: ['cyan'],
      },
    });

    userData.providers.forEach(provider => {
      table.push([
        provider.name,
        provider.creditsLimit.toString(),
        provider.creditsUsed.toString(),
        provider.apiKeys.length.toString(),
      ]);
    });

    consola.log(table.toString());

    // Display detailed API key information
    userData.providers.forEach(provider => {
      if (provider.apiKeys.length > 0) {
        consola.info(`\n${pc.cyan(provider.name)} API Keys:`);
        const keysTable = new Table({
          head: ['Name', 'Credits Used'],
          style: {
            head: ['cyan'],
          },
        });

        provider.apiKeys.forEach(key => {
          keysTable.push([key.name, key.creditsUsed.toString()]);
        });

        consola.log(keysTable.toString());
      }
    });
  }

  static displayUsersList(users: UserData[]) {
    // First combine users with same email
    const combinedUsers = this.combineUsers(users);

    const table = new Table({
      head: ['Email', 'Name', 'Providers'],
      style: {
        head: ['cyan'],
      },
    });

    // Sort users alphabetically by name
    const sortedUsers = [...combinedUsers].sort((a, b) => a.name.localeCompare(b.name));

    sortedUsers.forEach(user => {
      // Sort providers alphabetically by name
      const sortedProviders = [...user.providers].sort((a, b) => a.name.localeCompare(b.name));

      table.push([
        user.email,
        user.name,
        `(${sortedProviders.length}) ${sortedProviders.map(p => p.name).join(', ')}`,
      ]);
    });

    consola.log(table.toString());
  }

  private static combineUsers(users: UserData[]): UserData[] {
    const userMap = new Map<string, UserData>();

    users.forEach(user => {
      if (userMap.has(user.email)) {
        // Combine providers if user already exists
        const existingUser = userMap.get(user.email)!;

        // Add new providers that don't exist yet
        user.providers.forEach(newProvider => {
          const providerExists = existingUser.providers.some(p => p.name === newProvider.name);
          if (!providerExists) {
            existingUser.providers.push(newProvider);
          }
        });
      } else {
        // Add new user
        userMap.set(user.email, { ...user });
      }
    });

    return Array.from(userMap.values());
  }
}
