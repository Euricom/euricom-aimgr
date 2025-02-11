#!/usr/bin/env node

import debug from 'debug';
import dotenv from 'dotenv';
import { validateEnvironment } from './utils/environment';

// Validate environment before any other initialization
validateEnvironment();

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

type CommandOptions = {
  addKey: { email: string; provider: string };
  createUser: { email: string; name: string; provider?: string };
  disableUser: { email: string };
  listUsers: { filter?: string };
  removeUser: { email: string; provider?: string };
  setLimit: { email: string; provider: string; limit: number };
  setLimitProviders: { provider: string; limit: number };
  userDetails: { email: string };
};

const commandHandlers = {
  addKey: async (options: CommandOptions['addKey']) => {
    debugCmd('addKey command called with options: %O', options);
    // TODO: Implement addKey logic
  },
  createUser: async (options: CommandOptions['createUser']) => {
    debugCmd('createUser command called with options: %O', options);
    // TODO: Implement createUser logic
  },
  disableUser: async (options: CommandOptions['disableUser']) => {
    debugCmd('disableUser command called with options: %O', options);
    // TODO: Implement disableUser logic
  },
  exit: () => {
    debugCmd('exit command called');
  },
  listProviders: async () => {
    debugCmd('listProviders command called');
    // TODO: Implement listProviders logic
  },
  listUsers: async (options: CommandOptions['listUsers']) => {
    debugCmd('listUsers command called with options: %O', options);
    console.log('listUsers', options);
  },
  removeUser: async (options: CommandOptions['removeUser']) => {
    debugCmd('removeUser command called with options: %O', options);
    // TODO: Implement removeUser logic
  },
  setLimit: async (options: CommandOptions['setLimit']) => {
    debugCmd('setLimit command called with options: %O', options);
    // TODO: Implement setLimit logic
  },
  setLimitProviders: async (options: CommandOptions['setLimitProviders']) => {
    debugCmd('setLimitProviders command called with options: %O', options);
    // TODO: Implement setLimitProviders logic
  },
  userDetails: async (options: CommandOptions['userDetails']) => {
    debugCmd('userDetails command called with options: %O', options);
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
  )
  .addCommand(
    new Command('disable')
      .description('Disable a user')
      .argument('<email>', "User's email address")
      .action(async email => {
        commandHandlers.disableUser({ email });
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
