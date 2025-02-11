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
pnpm dev -- user list
pnpm dev -- user add --email john@example.com --name "John Doe"

# Build with watch mode (auto-rebuilds on changes)
pnpm build:watch

# Build the project for production
pnpm build

# Run the production build (with commands)
pnpm start -- user list
pnpm start -- user add --email john@example.com --name "John Doe"
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
```

## CLI Usage

```bash
# Show help and version
aimgr --help
aimgr --version

# User Management
aimgr user list                    # List all users
aimgr user list --filter john      # Filter users by email
aimgr user info john.doo@euri.com  # Show user details

# User Creation and Modification
aimgr user add --email john.doo@euri.com \
               --name "John Doo" \
               --provider openai,anthropic

aimgr user add-key john.doo@euri.com --provider openai,openrouter,anthropic
aimgr user set-limit john.doo@euri.com --provider openai --limit 10

# User Removal and Disabling
aimgr user disable john.doo@euri.com
aimgr user remove john.doo@euri.com
aimgr user remove john.doo@euri.com --provider openai

# Provider Management
aimgr provider list
aimgr provider set-limit --provider openai --limit 10
```

## Technical Stack

### Folder Structure

```
src/
├── commands/      # CLI command implementations
│   ├── list.ts
│   ├── create.ts
├── providers/     # API provider implementations
│   ├── openai.ts
│   ├── anthropic.ts
│   ├── open-router.ts
├── utils/         # Utility functions
│   ├── file-utils.ts
│   ├── logger.ts
├── cli.ts         # Main CLI entry point
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
  - Colors: picocolors
  - Spinners: cli-spinners
  - Console: better-console
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
