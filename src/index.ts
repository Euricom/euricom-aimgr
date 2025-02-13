#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings';
import consola from 'consola';
import dotenv from 'dotenv';
import { ProviderFactory } from './providers/provider-factory';
import { DisplayService } from './services/display-service';
import { LoadingService } from './services/loading-service';
import { UserDataService } from './services/user-data-service';

dotenv.config();

const program = new Command();

// Setup basic program info
program
  .name('api-manager')
  .description('CLI tool for API key and user management')
  .version('0.1.0');

// User commands
program
  .command('user')
  .description('User management commands')
  .addCommand(
    new Command('list')
      .description('List all registered users')
      .option('-f, --filter <filter>', 'Filter users by email')
      .action(async (options: { filter?: string }) => {
        try {
          LoadingService.start('Fetching users...');

          const providers = ProviderFactory.getInitializedProviders();

          if (0 === providers.length) {
            consola.error('No provider API keys configured');
            throw new Error('No provider API keys configured');
          }

          const usersArray = await Promise.all(
            providers.map(ProviderFactory.fetchUsersFromProvider)
          );
          const allUsers = usersArray.flat();
          await UserDataService.mergeAndSave(allUsers);

          const filteredUsers = await UserDataService.getFilteredUsers(options.filter);
          LoadingService.stop();
          DisplayService.displayUsersList(filteredUsers);
        } catch (error) {
          LoadingService.stop();
          consola.error('Failed to fetch users:', error);
        }
      })
  )
  .addCommand(
    new Command('add')
      .description('Create a new user')
      .requiredOption('-e, --email <email>', "User's email address")
      .requiredOption('-n, --name <name>', "User's name")
      .option('-p, --provider <providers>', 'Comma-separated list of providers')
      .action(async options => {
        try {
          consola.info('Adding user:', options);
        } catch (error) {
          consola.error('Failed to add user:', error);
        }
      })
  )
  .addCommand(
    new Command('info')
      .description('Show detailed user info')
      .argument('<email>', "User's email address")
      .action(async email => {
        try {
          consola.info('User info:', email);
        } catch (error) {
          consola.error('Failed to get user info:', error);
        }
      })
  )
  .addCommand(
    new Command('remove')
      .description('Remove provider(s) for a user')
      .argument('<email>', "User's email address")
      .option('-p, --provider <providers>', 'Comma-separated list of providers')
      .action(async (email, options) => {
        try {
          consola.info('Removing providers for user:', email, options);
        } catch (error) {
          consola.error('Failed to remove providers:', error);
        }
      })
  )
  .addCommand(
    new Command('add-key')
      .description('Add API key(s) for a user')
      .argument('<email>', "User's email address")
      .requiredOption('-p, --provider <providers>', 'Comma-separated list of providers')
      .action(async (email, options) => {
        try {
          consola.info('Adding API keys for user:', email, options);
        } catch (error) {
          consola.error('Failed to add API keys:', error);
        }
      })
  )
  .addCommand(
    new Command('set-limit')
      .description("Set credit limit for a user's provider")
      .argument('<email>', "User's email address")
      .requiredOption('-p, --provider <provider>', 'Provider name')
      .requiredOption('-l, --limit <limit>', 'Credit limit')
      .action(async (email, options) => {
        try {
          consola.info('Setting limit for user:', email, options);
        } catch (error) {
          consola.error('Failed to set limit:', error);
        }
      })
  )
  .addCommand(
    new Command('disable')
      .description('Disable a user')
      .argument('<email>', "User's email address")
      .action(async email => {
        try {
          consola.info('Disabling user:', email);
        } catch (error) {
          consola.error('Failed to disable user:', error);
        }
      })
  );

// Provider commands
program
  .command('provider')
  .description('Provider management commands')
  .addCommand(
    new Command('list').description('List all providers').action(async () => {
      const providers = ProviderFactory.getSupportedProviders();
      consola.info('Available providers:', providers);
    })
  )
  .addCommand(
    new Command('set-limit')
      .description('Set limit for all users for a provider')
      .requiredOption('-p, --provider <providers>', 'Comma-separated list of providers')
      .requiredOption('-l, --limit <limit>', 'Credit limit')
      .action(async options => {
        try {
          consola.info('Setting provider limit:', options);
        } catch (error) {
          consola.error('Failed to set provider limit:', error);
        }
      })
  );

program.parse();
