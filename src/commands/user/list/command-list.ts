import { Invite } from '@/domain/invite';
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
  invite?: boolean;
}

export async function userListCommand(options: ListOptions) {
  try {
    const aiProviders = [createProvider('anthropic'), createProvider('openai')];

    // Fetch invites
    loading.start('Loading invites...');
    const invitesFromProviders = await Promise.all(aiProviders.map(aiProvider => aiProvider.getInvites())).finally(() =>
      loading.stop()
    );

    const invitesToShow = invitesFromProviders
      .flatMap(invites => invites)
      .filter(
        invite =>
          invite.status === 'pending' &&
          (!options.filter || invite.email.toLowerCase().includes(options.filter.toLowerCase()))
      );

    await displayInviteList(invitesToShow, options.filter);

    // If the invite option is specified, exit after showing invites
    if (options.invite) {
      return; // Exit the function after displaying invites
    }

    // Fetch users
    loading.start('Loading users...');
    let users = store.get<User[]>('users') || [];
    if (users.length === 0 || options.sync) {
      const foundUsers = await Promise.all(aiProviders.map(aiProvider => aiProvider.getUsers())).finally(() =>
        loading.stop()
      );
      users = mergeUsers(foundUsers);
      store.set('users', users);
    }

    // Apply filter to users if specified
    if (options.filter) {
      users = users.filter(user => user.email.toLowerCase().includes(options.filter!.toLowerCase()));
    }

    // Display the user list
    const providerCounts = aiProviders.map(provider => ({
      name: provider.getName(),
      count: users.filter(user => user.providers.some(p => p.name === provider.getName())).length,
    }));

    consola.log(
      chalk.underline.cyan('\nUser List:') + (options.filter ? chalk.gray(` (filtered by "${options.filter}")`) : '')
    );
    if (!options.filter) {
      providerCounts.forEach(({ name, count }) => {
        consola.log(chalk.gray(`${name}: ${count} members`));
      });
    }

    displayTable(
      users.length > 0
        ? users.map(user => ({
            email: user.email,
            name: user.name,
            'member of?': user.providers.map(provider => provider.name).join(', '),
            'workspaces?':
              user.providers
                .filter(provider => provider.workspaceUrl)
                .map(provider => provider.name)
                .join(', ') || '/',
          }))
        : [{ email: '/', name: '/', 'member of?': '/', 'workspaces?': '/' }]
    );
  } catch (error) {
    consola.error(error);
  } finally {
    loading.stop();
  }
}

// Helper function to display the invite list
async function displayInviteList(invitesToShow: Invite[], filter?: string) {
  consola.log(chalk.underline.cyan('\nInvite List:') + (filter ? chalk.gray(` (filtered by "${filter}")`) : ''));
  displayTable(
    invitesToShow.length > 0
      ? invitesToShow.map(invite => ({
          email: invite.email,
          status: invite.status,
          provider: invite.provider,
          invitedAt: invite.invitedAt.toLocaleString(),
          expiresAt: invite.expiresAt.toLocaleString(),
        }))
      : [{ email: '/', status: '/', provider: '/', invitedAt: '/', expiresAt: '/' }] // Empty table row
  );
}
