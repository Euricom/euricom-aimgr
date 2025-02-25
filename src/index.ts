#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings';
import consola from 'consola';
import dotenv from 'dotenv';
import { inviteListCommand } from './commands/invite';
import {
  userAddCommand,
  userAssignCommand,
  userInfoCommand,
  userListCommand,
  userRemoveCommand,
} from './commands/user';
dotenv.config();

const program = new Command();

// Setup basic program info
program.name('api-manager').description('CLI tool for API key and user management').version('0.1.0');

// User commands
program
  .command('user')
  .description('User management commands')
  .addCommand(
    new Command('list')
      .description('List all registered users')
      .option('-f, --filter <filter>', 'Filter users by name')
      .option('-s, --sync', 'Force sync with providers')
      .action(userListCommand)
  )
  .addCommand(
    new Command('add')
      .description('Add a new member to a provider')
      .argument('<email>', "User's email address")
      .requiredOption('-p, --provider <providers>', 'Comma-separated list of providers (openai,anthropic)')
      .action(userAddCommand)
  )
  .addCommand(
    new Command('assign')
      .description('Assign a workspace for the provider member to manage API keys')
      .argument('<email>', "User's email address")
      .requiredOption('-p, --provider <providers>', 'Comma-separated list of providers (openai,anthropic)')
      .action(userAssignCommand)
  )
  .addCommand(
    new Command('info')
      .description('Show detailed user info')
      .argument('<email>', "User's email address")
      .action(userInfoCommand)
  )
  .addCommand(
    new Command('remove')
      .description('Remove member from provider. If no optional provider is provided, all providers will be removed.')
      .argument('<email>', "User's email address")
      .option('-p, --provider <providers>', 'Comma-separated list of providers (openai,anthropic)')
      .action(userRemoveCommand)
  );

program
  .command('invite')
  .description('Invite management commands')
  .addCommand(
    new Command('list')
      .description('List all the invites send to users that are still pending')
      .option('-f, --filter <filter>', 'Filter invites by email or name')
      .option(
        '-s, --status <status>',
        'Filter invites by status (pending, accepted, rejected). Defaults to pending if not provided.'
      )
      .action(inviteListCommand)
  );

// Provider commands
program
  .command('provider')
  .description('Provider management commands')
  .addCommand(
    new Command('list').description('List all providers').action(async () => {
      consola.info('yet to implement');
    })
  )
  .addCommand(
    new Command('set-limit')
      .description('Set limit for all users for a provider')
      .requiredOption('-p, --provider <providers>', 'Comma-separated list of providers')
      .requiredOption('-l, --limit <limit>', 'Credit limit')
      .action(async options => {
        consola.info('yet to implement', options);
      })
  );

program.parse();
