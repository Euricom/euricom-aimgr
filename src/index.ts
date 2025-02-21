#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings';
import consola from 'consola';
import dotenv from 'dotenv';
import { userAddCommand, userAssignCommand, userInfoCommand, userListCommand } from './commands/user';

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
      .description('Create a new user with provider(s)')
      .requiredOption('-e, --email <email>', "User's email address")
      .requiredOption('-p, --provider <providers>', 'Comma-separated list of providers (openai, anthropic)')
      .action(userAddCommand)
  )
  .addCommand(
    new Command('assign')
      .description('Assign a user to a provider')
      .requiredOption('-e, --email <email>', "User's email address")
      .requiredOption('-p, --provider <providers>', 'Comma-separated list of providers (openai, anthropic)')
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
      .description('Remove provider(s) for a user')
      .argument('<email>', "User's email address")
      .option('-p, --provider <providers>', 'Comma-separated list of providers (openai, anthropic)')
      .action(async (email, options) => {
        consola.info('yet to implement', email, options);
      })
  )
  .addCommand(
    new Command('add-key')
      .description('Add API key(s) for a user')
      .argument('<email>', "User's email address")
      .requiredOption('-p, --provider <providers>', 'Comma-separated list of providers')
      .action(async (email, options) => {
        consola.info('yet to implement', email, options);
      })
  )
  .addCommand(
    new Command('set-limit')
      .description("Set credit limit for a user's provider")
      .argument('<email>', "User's email address")
      .requiredOption('-p, --provider <provider>', 'Provider name')
      .requiredOption('-l, --limit <limit>', 'Credit limit')
      .action(async (email, options) => {
        consola.info('yet to implement', email, options);
      })
  )
  .addCommand(
    new Command('disable')
      .description('Disable a user')
      .argument('<email>', "User's email address")
      .action(async email => {
        consola.info('yet to implement', email);
      })
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
