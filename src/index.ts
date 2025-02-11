#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings';
import debugFn from 'debug';
import dotenv from 'dotenv';

dotenv.config();

// Create debug instances for different parts of the application
const debug = debugFn('aimgr:cli');

// Add some debug messages
debug('Initializing CLI application');

const program = new Command();

// Setup basic program info
program
  .name('api-manager')
  .description('CLI tool for API key and user management')
  .version('0.1.0');

debug('CLI configuration completed');

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
        console.log(options);
      })
  )

  .addCommand(
    new Command('list')
      .description('List all registered users')
      .option('-f, --filter <filter>', 'Filter users by email')
      .action(async options => {
        console.log(options);
      })
  )
  .addCommand(
    new Command('info')
      .description('Show detailed user info')
      .argument('<email>', "User's email address")
      .action(async email => {
        console.log(email);
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
        console.log(email, options);
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
        console.log(email, options);
      })
  )
  .addCommand(
    new Command('set-limit')
      .description("Set credit limit for a user's provider")
      .argument('<email>', "User's email address")
      .requiredOption('-p, --provider <provider>', 'Provider name')
      .requiredOption('-l, --limit <limit>', 'Credit limit')
      .action(async (email, options) => {
        console.log(email, options);
      })
  )
  .addCommand(
    new Command('disable')
      .description('Disable a user')
      .argument('<email>', "User's email address")
      .action(async email => {
        console.log(email);
      })
  );

program
  .command('provider')
  .description('Provider management commands')
  .addCommand(
    new Command('list').description('List all providers').action(async () => {
      console.log('list providers');
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
        console.log(options);
      })
  );

program.parse();
