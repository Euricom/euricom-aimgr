# API Manager CLI Tool Documentation

A command-line interface tool for managing API keys, users, and providers.

## Installation

```bash
npm install
npm link
```

## Usage

Run commands using the `aimgr` command:

```bash
aimgr <command> [options]
```

## Available Commands

### User Management

#### Create User

Creates a new user account.

```bash
aimgr create-user <email> <name>
```

Example:

```bash
aimgr create-user john@example.com "John Smith"
```

#### List All Users

Shows a table of all users. Can be filtered by email.

```bash
aimgr users [--filter <email>]
```

Example:

```bash
aimgr users
aimgr users --filter john@example
```

#### Get User Details

Displays detailed information about a specific user.

```bash
aimgr user <email>
```

Example:

```bash
aimgr user john@example.com
```

### Provider Management

#### List All Providers

Shows all available API providers.

```bash
aimgr providers
```

#### Get Provider Details

Displays detailed information about a specific provider.

```bash
aimgr provider-details <provider>
```

Example:

```bash
aimgr provider-details openai
```

#### Add Provider

Adds a provider for a specific user.

```bash
aimgr add-provider <email> --provider <provider>
```

Example:

```bash
aimgr add-provider john@example.com --provider openai
```

Supported providers: openai, anthropic, openrouter

#### Remove Provider

Removes a specific provider from a user.

```bash
aimgr delete-provider <email> <provider>
```

Example:

```bash
aimgr delete-provider john@example.com openai
```

#### Remove All Providers

Removes all providers from a user.

```bash
aimgr delete-providers <email>
```

Example:

```bash
aimgr delete-providers john@example.com
```

#### Set Provider Limit

Sets the credit limit for a specific provider.

```bash
aimgr set-limit <email> <provider> <limit>
```

Example:

```bash
aimgr set-limit john@example.com openai 1000
```

## Version

Current version: 0.1.0

```

```
