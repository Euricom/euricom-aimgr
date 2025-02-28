#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings';
import dotenv from 'dotenv';
import {
  userAssignCommand,
  userInfoCommand,
  userInviteCommand,
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
    new Command('invite')
      .description(
        'Invite a new member to a provider. If no optional provider is provided, all providers will be called.'
      )
      .argument('<email>', "User's email address")
      .option('-p, --provider <providers>', 'Comma-separated list of providers (openai,anthropic)')
      .action(userInviteCommand)
  )
  .addCommand(
    new Command('assign')
      .description(
        'Assign a workspace for the provider member to manage API keys. If no optional provider is provided, all providers will be called.'
      )
      .argument('<email>', "User's email address")
      .option('-p, --provider <providers>', 'Comma-separated list of providers (openai,anthropic)')
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
      .description('Remove member from provider. If no optional provider is provided, all providers will be called.')
      .argument('<email>', "User's email address")
      .option('-p, --provider <providers>', 'Comma-separated list of providers (openai,anthropic)')
      .action(userRemoveCommand)
  );

program.parse();
