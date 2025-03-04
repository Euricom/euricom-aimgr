import { mergeUsers, User } from '@/domain/user';
import { createProvider } from '@/providers/ai-provider-factory';
import * as store from '@/store';
import { displayTable } from '@/utils/display-table';
import { handleError } from '@/utils/error-handling';
import * as loading from '@/utils/loading';
import chalk from 'chalk';
import consola from 'consola';
import invariant from 'tiny-invariant';

export async function userInfoCommand(email: string) {
  try {
    loading.start(`Loading user info for ${email}...`);
    invariant(email.includes('@'), 'Invalid email format. Email must contain "@"');
    // get the providers that have a pending invite
    const aiProviders = [createProvider('anthropic'), createProvider('openai')];

    await Promise.all(
      aiProviders.map(async aiProvider => {
        const pendingInvite = await aiProvider.getUserPendingInvite(email.toLowerCase());
        if (pendingInvite) {
          loading.warn(
            `${email} has an invite for ${aiProvider.getName()}, pending since ${pendingInvite.invitedAt.toLocaleString()}`
          );
        }
      })
    );

    loading.start(`Loading user info for ${email}...`);
    // fetch the user info from the providers
    const userDetailsFromProviders = await Promise.all(
      aiProviders.map(aiProvider => aiProvider.getUserDetails(email.toLowerCase()))
    );
    loading.stop();
    const validUserDetails = userDetailsFromProviders.filter(userDetails => userDetails !== undefined);

    if (validUserDetails.length === 0) {
      loading.fail(`${email} not found in any provider`);
      return;
    }
    // Merge the user info from the providers into a single user object
    const mergedUser = mergeUsers(validUserDetails);
    const user = mergedUser[0];

    // if user didn't exist yet then add it to the users store, otherwise update the user
    const users = store.get<User[]>('users') || [];
    const userIndex = users.findIndex(user => user.email === email);
    if (userIndex === -1) {
      users.push(user);
    } else {
      users[userIndex] = user;
    }
    store.set('users', users);

    // display the user info
    consola.log(chalk.underline.cyan('\nUser Info:'));
    consola.log(
      `Email: ${user.email}\nName: ${user.name}\nMember of: ${user.providers.map(provider => provider.name).join(', ')}`
    );

    const providerData = user.providers
      .filter(provider => provider.workspaceUrl) // Only include providers with workspace data
      .map(provider => ({
        Provider: provider.name,
        'Credits Used': provider.creditsUsed ? `${provider.creditsUsed} $/month` : '/',
        'Workspace URL': provider.workspaceUrl ? provider.workspaceUrl : '/',
      }));

    consola.log(chalk.underline.cyan('\nAssigned Workspaces:'));
    displayTable(
      providerData.length > 0 ? providerData : [{ Provider: '/', 'Credits Used': '/', 'Workspace URL': '/' }]
    );

    consola.log(chalk.underline.cyan('\nAPI Keys:'));
    const apiKeysData = user.providers.flatMap(provider => {
      const apiKeys = provider.apiKeys || [];
      return apiKeys.map(key => ({
        Provider: provider.name,
        'ApiKey Name': key.name,
        'Key Hint': key.keyHint,
      }));
    });

    // Always display the table, even if no API keys are found
    displayTable(apiKeysData.length > 0 ? apiKeysData : [{ Provider: '/', 'ApiKey Name': '/', 'Key Hint': '/' }]);
  } catch (error) {
    handleError(error);
  } finally {
    loading.stop();
  }
}
