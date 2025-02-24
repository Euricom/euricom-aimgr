import { mergeUsers, User } from '@/domain/user';
import { createProvider } from '@/providers/ai-provider-factory';
import * as store from '@/store';
import { displayTable } from '@/utils/display-table';
import * as loading from '@/utils/loading';
import chalk from 'chalk';
import consola from 'consola';
import invariant from 'tiny-invariant';

export async function userInfoCommand(email: string) {
  try {
    loading.start('Loading user info...');
    invariant(email.includes('@'), 'Invalid email format. Email must contain "@"');

    // get the providers that have a pending invite
    const aiProviders = [createProvider('anthropic'), createProvider('openai')];
    const invitePendingStatus = await Promise.all(
      aiProviders.map(aiProvider => aiProvider.isUserInvitePending(email.toLowerCase()))
    );

    // filter out the providers that have a pending invite
    const pendingProviders = aiProviders
      .filter((_, index) => invitePendingStatus[index])
      .map(aiProvider => aiProvider.getName());

    if (pendingProviders.length > 0) {
      consola.warn(`User ${email} has pending invites for the following providers: ${pendingProviders.join(', ')}`);
    }

    // fetch the user info from the providers that don't have a pending invite
    const userInfoFromProviders = await Promise.all(
      aiProviders
        .filter((_, index) => !invitePendingStatus[index])
        .map(aiProvider => aiProvider.getUserInfo(email.toLowerCase()))
    );

    // Filter out any undefined results
    const validUserInfo = userInfoFromProviders.filter(userInfo => userInfo !== undefined);

    // Check if we have any valid user info
    if (validUserInfo.length === 0) {
      consola.warn(
        `User with email ${email} not found in any provider. Please make sure the user is a member of at least one provider.`
      );
      return;
    }

    // Merge the user info from the providers into a single user object
    const mergedUser = mergeUsers(validUserInfo);
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

    consola.log(chalk.underline.cyan('\n\nUser Info:'));
    consola.log(
      `Email: ${user.email}\nName: ${user.name}\nMember of: ${user.providers.map(provider => provider.name).join(', ')}`
    );

    const providerData = user.providers.map(provider => ({
      Provider: provider.name,
      'Credits Used': provider.creditsUsed ? `${provider.creditsUsed} $/month` : '/',
      'Credits Limit': provider.setLimitUrl ? provider.setLimitUrl : 'Not set',
    }));

    consola.log(chalk.underline.cyan('\nAssigned Providers:'));
    displayTable(providerData);

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
    consola.error(error);
  } finally {
    loading.stop();
  }
}
