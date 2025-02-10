#!/usr/bin/env node

import dotenv from "dotenv";
dotenv.config();

import { Command } from "@commander-js/extra-typings";
import {
  handleAddProvider,
  handleCreateUser,
  handleListProviders,
  handleListUsers,
  handleProviderDetails,
  handleRemoveAllProviders,
  handleRemoveProvider,
  handleSetProviderLimit,
  handleUserDetails,
} from "./commands";

const program = new Command();

// Setup basic program info
program
  .name("api-manager")
  .description("CLI tool for API key and user management")
  .version("0.1.0");

// Command map for interactive mode
const commandHandlers = {
  createUser: handleCreateUser,
  listUsers: handleListUsers,
  userDetails: handleUserDetails,
  removeAllProviders: handleRemoveAllProviders,
  removeProvider: handleRemoveProvider,
  listProviders: handleListProviders,
  providerDetails: handleProviderDetails,
  addProvider: handleAddProvider,
  setProviderLimit: handleSetProviderLimit,
  exit: () => {},
} as const;

type CommandType = keyof typeof commandHandlers;

// Direct CLI commands

program
  .command("create-user")
  .description("Create a new user")
  .argument("<email>", "User's email address")
  .argument("<name>", "User's name")
  .action(async (email, name) => {
    await handleCreateUser(email, name);
  });

program
  .command("users")
  .description("List all registered users")
  .option("-f, --filter <email>", "Filter users by email")
  .action(async (options) => {
    await handleListUsers(options.filter);
  });

program
  .command("user")
  .description("View user account details")
  .argument("<email>", "User's email address")
  .action(async (email) => {
    await handleUserDetails(email);
  });

program
  .command("add-provider")
  .description("Add a provider for user")
  .argument("<email>", "User's email address")
  .requiredOption(
    "-p, --provider <provider>",
    "API provider (openai, anthropic, openrouter)"
  )
  .action(async (email, options) => {
    await commandHandlers.addProvider(email, options.provider);
  });

program
  .command("delete-providers")
  .description("Delete all providers from user")
  .argument("<email>", "User's email address")
  .action(async (email) => {
    await commandHandlers.removeAllProviders(email);
  });

program
  .command("delete-provider")
  .description("Delete specific provider from user")
  .argument("<email>", "User's email address")
  .argument("<provider>", "Provider to remove (openai, anthropic, openrouter)")
  .action(async (email, provider) => {
    await commandHandlers.removeProvider(email, provider);
  });

program
  .command("providers")
  .description("View all available providers")
  .action(async () => {
    await commandHandlers.listProviders();
  });

program
  .command("provider-details")
  .description("View provider details")
  .argument("<provider>", "Provider name (openai, anthropic, openrouter)")
  .action(async (provider) => {
    await commandHandlers.providerDetails(provider);
  });

program
  .command("set-limit")
  .description("Set credit limit for a provider")
  .argument("<email>", "User's email address")
  .argument("<provider>", "Provider name (openai, anthropic, openrouter)")
  .argument("<limit>", "New credit limit")
  .action(async (email, provider, limit) => {
    await commandHandlers.setProviderLimit(email, provider, Number(limit));
  });

program.parse();
