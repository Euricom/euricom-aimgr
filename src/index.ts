#!/usr/bin/env node

import dotenv from "dotenv";
dotenv.config();

import { Command } from "@commander-js/extra-typings";

const program = new Command();

// Setup basic program info
program
  .name("api-manager")
  .description("CLI tool for API key and user management")
  .version("0.1.0");

// Command map for interactive mode
const commandHandlers = {
  // user commands
  createUser: (options: any) => console.log("not implemented", options),
  listUsers: (options: any) => console.log("not implemented", options),
  userDetails: (options: any) => console.log("not implemented", options),
  disableUser: (options: any) => console.log("not implemented", options),
  removeUser: (options: any) => console.log("not implemented", options),
  addKey: (options: any) => console.log("not implemented", options),
  setLimit: (options: any) => console.log("not implemented", options),
  // provider commands
  listProviders: () => console.log("not implemented"),
  setLimitProviders: (options: any) => console.log("not implemented", options),
  exit: () => {},
} as const;

// Direct CLI commands

program
  .command("user")
  .description("User management commands")
  .addCommand(
    new Command("add")
      .description("Create a new user")
      .requiredOption("-e, --email <email>", "User's email address")
      .requiredOption("-n, --name <name>", "User's name")
      .option(
        "-p, --provider <providers>",
        "Comma-separated list of providers (openai,anthropic,openrouter)"
      )
      .action(async (options) => {
        commandHandlers.createUser(options);
      })
  )

  .addCommand(
    new Command("list")
      .description("List all registered users")
      .option("-f, --filter <filter>", "Filter users by email")
      .action(async (options) => {
        commandHandlers.listUsers(options);
      })
  )
  .addCommand(
    new Command("info")
      .description("Show detailed user info")
      .argument("<email>", "User's email address")
      .action(async (email) => {
        commandHandlers.userDetails(email);
      })
  )
  .addCommand(
    new Command("remove")
      .description("Remove provider(s) for a user")
      .argument("<email>", "User's email address")
      .option(
        "-p, --provider <providers>",
        "Specific provider to remove (if not specified, removes all)",
        "Comma-separated list of providers (openai,anthropic,openrouter)"
      )
      .action(async (email, options) => {
        commandHandlers.removeUser({
          email,
          provider: options.provider,
        });
      })
  )
  .addCommand(
    new Command("add-key")
      .description("Add API key(s) for a user")
      .argument("<email>", "User's email address")
      .requiredOption(
        "-p, --provider <providers>",
        "Comma-separated list of providers (openai,anthropic,openrouter)"
      )
      .action(async (email, options) => {
        commandHandlers.addKey({
          email,
          provider: options.provider,
        });
      })
  )
  .addCommand(
    new Command("set-limit")
      .description("Set credit limit for a user's provider")
      .argument("<email>", "User's email address")
      .requiredOption("-p, --provider <provider>", "Provider name")
      .requiredOption("-l, --limit <limit>", "Credit limit")
      .action(async (email, options) => {
        commandHandlers.setLimit({
          email,
          provider: options.provider,
          limit: options.limit,
        });
      })
  );

program
  .command("provider")
  .description("Provider management commands")
  .addCommand(
    new Command("list").description("List all providers").action(async () => {
      commandHandlers.listProviders();
    })
  )

  .addCommand(
    new Command("set-limit")
      .description("Set limit for all users for a provider")
      .requiredOption(
        "-p, --provider <providers>",
        "Comma-separated list of providers (openai,anthropic,openrouter)"
      )
      .requiredOption("-l, --limit <limit>", "Credit limit")
      .action(async (options) => {
        commandHandlers.setLimit({
          provider: options.provider,
          limit: options.limit,
        });
      })
  );

program.parse();
