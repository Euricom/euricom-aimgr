import { Invite } from '@/domain/invite';
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
    const aiProviders = [createProvider('anthropic'), createProvider('openai')];

    // Validate status option using invariant
    const validStatuses: Invite['status'][] = ['pending', 'accepted', 'expired', 'deleted'];
    invariant(
      !options.status || validStatuses.includes(options.status.toLowerCase() as Invite['status']),
      `Invalid status value: ${options.status}. Valid options are: ${validStatuses.join(', ')}`
    );

    // Fetch invites in parallel
    const invitesFromProviders = await Promise.all(aiProviders.map(aiProvider => aiProvider.getInvites()));
    // flat the invites
    let invitesToShow = invitesFromProviders.flatMap(invites => invites);
    // Determine the status filter
    const statusFilter = options.status ? options.status.toLowerCase() : 'pending';
    const filterLower = options.filter ? options.filter.toLowerCase() : '';

    // Filter invites in a single pass
    invitesToShow = invitesToShow.filter(invite => {
      const inviteStatus = invite.status.toLowerCase();
      const inviteEmail = invite.email.toLowerCase();
      return inviteStatus === statusFilter && inviteEmail.includes(filterLower);
    });

    // Display the invite list
    consola.log(chalk.underline.cyan('\nInvite List:'));
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
