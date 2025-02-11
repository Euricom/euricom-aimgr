#!/usr/bin/env node

import debug from 'debug';
import dotenv from 'dotenv';
dotenv.config();

// Create debug instances for different parts of the application
const debugCLI = debug('aimgr:cli');
const debugCmd = debug('aimgr:cmd');

import { Command } from '@commander-js/extra-typings';

const program = new Command();

// Setup basic program info
program
  .name('api-manager')
  .description('CLI tool for API key and user management')
  .version('0.1.0');

debugCLI('CLI initialized');

// Command map for interactive mode
const commandHandlers = {
  addKey: async (options: any) => {
    debugCmd('addKey command called with options: %O', options);
    // TODO: Implement addKey logic
  },
  createUser: async (options: any) => {
    debugCmd('createUser command called with options: %O', options);
    // TODO: Implement createUser logic
  },
  disableUser: async (options: any) => {
    // TODO: Implement disableUser logic
  },
  exit: () => {},
  listProviders: async () => {
    // TODO: Implement listProviders logic
  },
  listUsers: async (options: any) => {
    console.log('listUsers', options);
  },
  removeUser: async (options: any) => {
    // TODO: Implement removeUser logic
  },
  setLimit: async (options: any) => {
    // TODO: Implement setLimit logic
  },
  setLimitProviders: async (options: any) => {
    // TODO: Implement setLimitProviders logic
  },
  userDetails: async (options: any) => {
    // TODO: Implement userDetails logic
  },
} as const;

// Direct CLI commands

program
  .command('user')
  .description('User management commands')
  .addCommand(
    new Command('add')
      .description('Create a new user')
      .requiredOption('-e, --email <email>', "User's email address")
      .requiredOption('-n, --name <name>', "User's name")
      .option(
        '-p, --provider <providers>',
        'Comma-separated list of providers (openai,anthropic,openrouter)'
      )
      .action(async options => {
        commandHandlers.createUser(options);
      })
  )

  .addCommand(
    new Command('list')
      .description('List all registered users')
      .option('-f, --filter <filter>', 'Filter users by email')
      .action(async options => {
        commandHandlers.listUsers(options);
      })
  )
  .addCommand(
    new Command('info')
      .description('Show detailed user info')
      .argument('<email>', "User's email address")
      .action(async email => {
        commandHandlers.userDetails(email);
      })
  )
  .addCommand(
    new Command('remove')
      .description('Remove provider(s) for a user')
      .argument('<email>', "User's email address")
      .option(
        '-p, --provider <providers>',
        'Specific provider to remove (if not specified, removes all)',
        'Comma-separated list of providers (openai,anthropic,openrouter)'
      )
      .action(async (email, options) => {
        commandHandlers.removeUser({
          email,
          provider: options.provider,
        });
      })
  )
  .addCommand(
    new Command('add-key')
      .description('Add API key(s) for a user')
      .argument('<email>', "User's email address")
      .requiredOption(
        '-p, --provider <providers>',
        'Comma-separated list of providers (openai,anthropic,openrouter)'
      )
      .action(async (email, options) => {
        commandHandlers.addKey({
          email,
          provider: options.provider,
        });
      })
  )
  .addCommand(
    new Command('set-limit')
      .description("Set credit limit for a user's provider")
      .argument('<email>', "User's email address")
      .requiredOption('-p, --provider <provider>', 'Provider name')
      .requiredOption('-l, --limit <limit>', 'Credit limit')
      .action(async (email, options) => {
        commandHandlers.setLimit({
          limit: options.limit,
          provider: options.provider,
        });
      })
  );

program
  .command('provider')
  .description('Provider management commands')
  .addCommand(
    new Command('list').description('List all providers').action(async () => {
      commandHandlers.listProviders();
    })
  )

  .addCommand(
    new Command('set-limit')
      .description('Set limit for all users for a provider')
      .requiredOption(
        '-p, --provider <providers>',
        'Comma-separated list of providers (openai,anthropic,openrouter)'
      )
      .requiredOption('-l, --limit <limit>', 'Credit limit')
      .action(async options => {
        commandHandlers.setLimitProviders(options);
      })
  );

debugCLI('Parsing command line arguments');
program.parse();
