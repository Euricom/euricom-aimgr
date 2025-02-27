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
    const aiProviders = [createProvider('anthropic'), createProvider('openai')];
    // Fetch from providers if store is empty or sync is requested
    if (users.length === 0 || options.sync) {
      const foundUsers = await Promise.all(aiProviders.map(aiProvider => aiProvider.getUsers()));
      users = mergeUsers(foundUsers);
      store.set('users', users);
    }

    // Apply filter if specified
    if (options.filter) {
      users = users.filter(user => user.email.toLowerCase().includes(options.filter!.toLowerCase()));
    }

    // Get the pending invites for all the providers
    const invitesFromProviders = await Promise.all(aiProviders.map(aiProvider => aiProvider.getInvites()));
    // flat the invites
    let invitesToShow = invitesFromProviders.flatMap(invites => invites);
    const filterLower = options.filter ? options.filter.toLowerCase() : '';
    // Filter invites by status pending and filter by email if specified
    // Filter invites in a single pass
    invitesToShow = invitesToShow.filter(invite => {
      return invite.status === 'pending' && invite.email.toLowerCase().includes(filterLower);
    });

    // Log the number of members in each provider
    const providerCounts = aiProviders.map(provider => ({
      name: provider.getName(),
      count: users.filter(user => user.providers.some(p => p.name === provider.getName())).length,
    }));

    // Display the user list
    consola.log(
      chalk.underline.cyan('\nUser List:') + (options.filter ? chalk.gray(` (filtered by "${options.filter}")`) : '')
    );
    if (!options.filter) {
      providerCounts.forEach(({ name, count }) => {
        consola.log(chalk.gray(`${name}: ${count} members`));
      });
    }

    displayTable(
      (() => {
        if (users.length > 0) {
          return users.map(user => ({
            email: user.email,
            name: user.name,
            'member of?': user.providers.map(provider => provider.name).join(', '),
            'workspaces?':
              user.providers
                .filter(provider => provider.workspaceUrl) // Filter providers with a workspaceUrl
                .map(provider => provider.name) // Get provider names
                .join(', ') || '/', // Join them into a string or show "/"
          }));
        }
        return [{ email: '/', name: '/', 'member of?': '/', 'workspaces?': '/' }];
      })()
    );

    // Display the invite list
    consola.log(
      chalk.underline.cyan('\nInvite List:') + (options.filter ? chalk.gray(` (filtered by "${options.filter}")`) : '')
    );
    displayTable(
      (() => {
        if (invitesToShow.length > 0) {
          return invitesToShow.map(invite => ({
            email: invite.email,
            status: invite.status,
            provider: invite.provider,
            invitedAt: invite.invitedAt.toLocaleString(),
            expiresAt: invite.expiresAt.toLocaleString(),
          }));
        }
        return [{ email: '/', status: '/', provider: '/', invitedAt: '/', expiresAt: '/' }]; // Empty table row
      })()
    );
  } catch (error) {
    consola.error(error);
  } finally {
    loading.stop();
  }
}
