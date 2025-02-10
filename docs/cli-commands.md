# API Manager CLI Tool Documentation

A command-line interface tool for managing API keys, users, and providers.

## Installation

```bash
npm install
```

## Usage

Run commands in development mode:

```bash
npm run dev -- <command> [options]
```

Or in production mode after building:

```bash
npm run build
npm start -- <command> [options]
```

## Available Commands

### User Management

#### Create User

Creates a new user account.

```bash
npm run dev -- create-user <email> <name>
```

Example:

```bash
npm run dev -- create-user john@example.com "John Smith"
```

#### List All Users

Shows a table of all users. Can be filtered by email.

```bash
npm run dev -- users [--filter <email>]
```

Example:

```bash
npm run dev -- users
npm run dev -- users --filter john@example
```

#### Get User Details

Displays detailed information about a specific user.

```bash
npm run dev -- user <email>
```

Example:

```bash
npm run dev -- user john@example.com
```

### Provider Management

#### List All Providers

Shows all available API providers.

```bash
npm run dev -- providers
```

#### Get Provider Details

Displays detailed information about a specific provider.

```bash
npm run dev -- provider-details <provider>
```

Example:

```bash
npm run dev -- provider-details openai
```

#### Add Provider

Adds a provider for a specific user.

```bash
npm run dev -- add-provider <email> --provider <provider>
```

Example:

```bash
npm run dev -- add-provider john@example.com --provider openai
```

Supported providers: openai, anthropic, openrouter

#### Remove Provider

Removes a specific provider from a user.

```bash
npm run dev -- delete-provider <email> <provider>
```

Example:

```bash
npm run dev -- delete-provider john@example.com openai
```

#### Remove All Providers

Removes all providers from a user.

```bash
npm run dev -- delete-providers <email>
```

Example:

```bash
npm run dev -- delete-providers john@example.com
```

#### Set Provider Limit

Sets the credit limit for a specific provider.

```bash
npm run dev -- set-limit <email> <provider> <limit>
```

Example:

```bash
npm run dev -- set-limit john@example.com openai 1000
```

## Version

Current version: 0.1.0

```

```
