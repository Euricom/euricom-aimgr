# euricom-aimgr

CLI tool for API key and user management

## Installation

First, install pnpm globally:

```bash
npm install -g pnpm
```

Then install dependencies:

```bash
pnpm install
```

To install the CLI tool globally:

```bash
npm install https://github.com/euricom/euricom-aimgr.git --global
```

## Development

```bash
# Run in development mode (with commands)
pnpm dev user list
pnpm dev user invite john@example.com --provider openai

# Build the project
pnpm build

# Run in production mode (after building)
aimgr user list
aimgr user invite john@example.com --provider openai

# Build with watch mode (auto-rebuilds on changes)
pnpm build:watch
```

### Development Scripts

```bash
# Code quality
pnpm lint          # Check code for linting errors
pnpm lint:fix      # Fix linting errors
pnpm format        # Format code
pnpm format:check  # Check code formatting
pnpm spell         # Check spelling
pnpm spell:fix     # Fix spelling errors
pnpm clean         # Remove build artifacts
pnpm test          # Run tests
```

## CLI Usage

```bash
# Show help and version
aimgr --help -h
aimgr --version -v

# User Management
aimgr user list                    # List all registered users
aimgr user list --filter -f <filter>  # Filter users by email
aimgr user list --sync -s            # Force sync with providers
aimgr user info <email>            # Show detailed user info

# User Invite
aimgr user invite <email> --provider -p <providers>  # Invite a new member to a provider
# Example: aimgr user invite john@example.com --provider -p openai

# User Assign to Workspace
aimgr user assign <email> --provider -p <providers>   # Assign a workspace for the user
# Example: aimgr user assign john@example.com --provider -p openai

# User Removal
aimgr user remove <email> --provider -p <providers>  # Remove member from provider
# If no optional provider is provided, all providers will be removed.
# Example: aimgr user remove john@example.com --provider -p openai

```

## Technical Stack

### Folder Structure

```
src/
├── commands/                  # CLI command implementations
│   ├── user/
│   │   ├── assign/
│   │   │   ├── command-assign.ts
│   │   │   ├── command-assign.spec.ts
│   │   ├── invite/
│   │   │   ├── command-invite.ts
│   │   │   ├── command-invite.spec.ts
│   │   ├── info/
│   │   │   ├── command-info.ts
│   │   │   ├── command-info.spec.ts
│   │   ├── list/
│   │   │   ├── command-list.ts
│   │   │   ├── command-list.spec.ts
│   │   ├── remove/
│   │   │   ├── command-remove.ts
│   │   │   ├── command-remove.spec.ts
│   │   ├── index.ts
├── providers/                 # Provider implementations
│   ├── anthropic-provider.ts
│   ├── openai-provider.ts
│   ├── ai-provider-factory.ts
│   ├── ai-provider.ts
├── utils/                     # Utility functions
│   ├── base-api-client.ts
│   ├── dates-utils.ts
│   ├── display-table.ts
│   ├── loading.ts
├── domain/                    # Domain models
│   ├── user.ts
├── index.ts                   # Main CLI entry point
```

### Tools & Requirements

- Node.js >=18
- Package Manager: pnpm >=10.0.0
- Language: TypeScript
- Build: tsup
- Linting: oxlint
- Formatting: prettier
- Spelling: cspell

### Core Libraries

- CLI Framework: Commander & Inquirer
- UI Elements:
  - Colors: chalk
  - Loading: ora
  - Console: consola
  - Tables: cli-table3
- Development: tsx
- Debugging: debug

### Debugging

This project uses the `debug` package for debugging. To enable debug logs:

```bash
# On Windows PowerShell:
$env:DEBUG='aimgr:*'; pnpm dev -- user list

# On Windows CMD:
set DEBUG=aimgr:* && pnpm dev -- user list

# On Unix-like systems (Linux, macOS):
DEBUG=aimgr:* pnpm dev -- user list
```

# For specific components only:

```bash
# PowerShell
$env:DEBUG='aimgr:cli'; pnpm dev -- user list
$env:DEBUG='aimgr:cmd'; pnpm dev -- user list

# CMD
set DEBUG=aimgr:cli && pnpm dev -- user list
set DEBUG=aimgr:cmd && pnpm dev -- user list
```

Available debug namespaces:

- `aimgr:cli` - Core CLI initialization and setup
- `aimgr:cmd` - Command execution and handling

To disable debugging:

```bash
# PowerShell
$env:DEBUG=''; pnpm dev -- user list
# or
Remove-Item Env:DEBUG; pnpm dev -- user list

# CMD
set DEBUG= && pnpm dev -- user list

# Unix
DEBUG= pnpm dev -- user list
```
