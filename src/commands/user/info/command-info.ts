import { mergeUsers, User } from '@/domain/user';
import { createProvider } from '@/providers/ai-provider-factory';
import * as store from '@/store';
import { displayTable } from '@/utils/display-table';
import * as loading from '@/utils/loading';
import { consola } from 'consola';
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

    // fetch the user info from the providers that don't have a pending invite
    const userInfoFromProviders = await Promise.all(
      aiProviders
        .filter((_, index) => !invitePendingStatus[index])
        .map(aiProvider => aiProvider.fetchUserInfo(email.toLowerCase()))
    );

    // merge the user info from the providers into a single user object
    const mergedUser = mergeUsers(userInfoFromProviders);
    const user = mergedUser[0];

    if (user.providers.length === 0) {
      consola.error(`User with email ${email} not found`);
      return;
    }

    // if user didn't exist yet then add it to the users store, otherwise update the user
    const users = store.get<User[]>('users') || [];
    const userIndex = users.findIndex(user => user.email === email);
    if (userIndex === -1) {
      users.push(user);
    } else {
      users[userIndex] = user;
    }
    store.set('users', users);

    if (pendingProviders.length > 0) {
      consola.warn(`User ${email} has pending invites for the following providers: ${pendingProviders.join(', ')}`);
    }

    // display the user info in a table
    consola.log(`\nUser Info (${user.email}):`);
    displayTable([
      {
        Email: user.email,
        Name: user.name,
        Providers: user.providers.map(provider => provider.name).join(', '),
      },
    ]);

    // Showcase the costs for each provider
    consola.log('\nCredits Used:');
    displayTable(
      user.providers.map(provider => ({
        Provider: provider.name,
        'Credits Used': provider.creditsUsed ? `${provider.creditsUsed} $/month` : '/',
        'Set Credits Limit (url)': provider.setLimitUrl || '',
      }))
    );

    // Display the API keys in a table format.
    consola.log('\nAPI Keys:');
    displayTable(
      user.providers.flatMap(
        provider =>
          provider.apiKeys?.map(key => ({
            Provider: provider.name,
            'ApiKey Name': key.name,
            'Key Hint': key.keyHint,
          })) || [] // Ensure we return an empty array if apiKeys is undefined
      )
    );
  } catch (error) {
    consola.error(error);
  } finally {
    loading.stop();
  }
}
