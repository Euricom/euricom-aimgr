import { createProvider } from '@/providers/ai-provider-factory';
import { displayTable } from '@/utils/display-table';
import * as loading from '@/utils/loading';
import chalk from 'chalk';
import consola from 'consola';

interface ListOptions {
  filter?: string;
}

export async function inviteListCommand(options: ListOptions) {
  try {
    loading.start('Loading invite list...');
    const aiProviders = [createProvider('openai'), createProvider('anthropic')];
    const pendingInvitesFromProviders = await Promise.all(
      aiProviders.map(aiProvider => aiProvider.getPendingInvites())
    );
    const pendingInvites = mergeInvites(pendingInvitesFromProviders);

    consola.log(chalk.underline.cyan('\nInvite List:'));
    displayTable(pendingInvites);
  } catch (error) {
    consola.error(error);
  } finally {
    loading.stop();
  }
}

function mergeInvites(pendingInvitesFromProviders: any[]) {
  return pendingInvitesFromProviders.flat().map(invite => ({
    ...invite,
  }));
}
