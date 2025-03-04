# euricom-aimgr

CLI tool for API key and user management for AI providers.

### Supported Providers

This CLI tool supports the following providers:

- **OpenAI**
- **Anthropic**

## Installation

To install the `aimgr` CLI tool on your machine, follow these steps:

### 1. Install the CLI tool globally:

```bash
npm install @euricom/aimgr -g
```

### 2. Set Up Environment Variables:

```bash
OPENAI_ADMIN_KEY=your-openai-admin-key
ANTHROPIC_ADMIN_KEY=your-anthropic-admin-key
```

### 3. Verify Installation:

```bash
aimgr --version
```

## CLI Usage

```bash
# Show help and version
aimgr --help -h
aimgr --version -v

# User Management
aimgr user list                    # List all registered users
aimgr user list --filter -f <filter>  # Filter users by email or name
aimgr user list --sync -s            # Force sync with providers
aimgr user list --invite -i          # Show invite list only (does not include users)
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

# Available debug namespaces:

- `aimgr:cli` - Core CLI initialization and setup
- `aimgr:cmd` - Command execution and handling
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
