import { createProvider } from '@/providers/ai-provider-factory';
import { displayTable } from '@/utils/display-table';
import * as loading from '@/utils/loading';
import chalk from 'chalk';
import consola from 'consola';
import invariant from 'tiny-invariant';

interface ListOptions {
  filter?: string;
  status?: string;
}

export async function inviteListCommand(options: ListOptions) {
  try {
    loading.start('Loading invite list...');
    const aiProviders = [createProvider('openai'), createProvider('anthropic')];
    // if option status is provided, check if it is valid
    if (options.status) {
      invariant(
        options.status === 'pending' || options.status === 'accepted' || options.status === 'rejected',
        'Invalid status. Status must be pending, accepted, or rejected.'
      );
    }

    // Fetch invites in parallel
    const pendingInvitesResults = await Promise.all(
      aiProviders.map(aiProvider =>
        aiProvider.getInvites().then(invites => ({ provider: aiProvider.getName(), invites }))
      )
    );

    // Flatten and merge invites
    let pendingInvites = pendingInvitesResults.flatMap(({ invites }) => invites);

    // Determine the status filter
    const statusFilter = options.status ? options.status.toLowerCase() : 'pending';
    const filterLower = options.filter ? options.filter.toLowerCase() : '';

    // Filter invites in a single pass
    pendingInvites = pendingInvites.filter(invite => {
      const inviteStatus = invite.status.toLowerCase();
      const inviteEmail = invite.email.toLowerCase();
      return inviteStatus === statusFilter && inviteEmail.includes(filterLower);
    });

    // Display the invite list
    consola.log(chalk.underline.cyan('\nInvite List:'));

    displayTable(
      (() => {
        if (pendingInvites.length > 0) {
          return pendingInvites.map(invite => ({
            email: invite.email,
            status: invite.status,
            provider: invite.provider,
          }));
        }
        return [{ email: '/', status: '/', provider: '/' }]; // Empty table row
      })()
    );
  } catch (error) {
    consola.error(error);
  } finally {
    loading.stop();
  }
}
