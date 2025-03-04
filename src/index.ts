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
program.name('aimgr').description('CLI tool for API key and user management').version();

// User commands
program
  .command('user')
  .description('User management commands')
  .addCommand(
    new Command('list')
      .description('List all registered users')
      .option('-f, --filter <filter>', 'Filter users by email or name')
      .option('-s, --sync', 'Force sync with providers')
      .option('-i, --invite', 'Show invite list only (does not include users)')
      .action(userListCommand)
      .showHelpAfterError()
  )
  .addCommand(
    new Command('invite')
      .description(
        'Invite a new member to a provider. If no optional provider is provided, all providers will be called.'
      )
      .argument('<email>', "User's email address")
      .option('-p, --provider <providers>', 'Comma-separated list of providers (openai,anthropic)')
      .action(userInviteCommand)
      .showHelpAfterError()
  )
  .addCommand(
    new Command('assign')
      .description(
        'Assign a workspace for the provider member to manage API keys. If no optional provider is provided, all providers will be called.'
      )
      .argument('<email>', "User's email address")
      .option('-p, --provider <providers>', 'Comma-separated list of providers (openai,anthropic)')
      .action(userAssignCommand)
      .showHelpAfterError()
  )
  .addCommand(
    new Command('info')
      .description('Show detailed user info')
      .argument('<email>', "User's email address")
      .action(userInfoCommand)
      .showHelpAfterError()
  )
  .addCommand(
    new Command('remove')
      .description('Remove member from provider. If no optional provider is provided, all providers will be called.')
      .argument('<email>', "User's email address")
      .option('-p, --provider <providers>', 'Comma-separated list of providers (openai,anthropic)')
      .action(userRemoveCommand)
      .showHelpAfterError()
  );

program.parse();
