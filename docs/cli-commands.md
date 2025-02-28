# AI Manager CLI Commands

## Basic Commands

```bash
# show help
aimgr --help

# show version
aimgr --version
```

## User Management

### List Users

```bash
# list all registered users
aimgr user list

# filter users by email
aimgr user list --filter <filter>

# force sync with providers
aimgr user list --sync
```

### User Info

```bash
# show detailed user info
aimgr user info <email>
```

### Invite User

```bash
# invite a new member to a provider
aimgr user invite <email> --provider <providers>

# Example:
aimgr user invite john@example.com --provider openai
```

### Assign User to Workspace

```bash
# assign a workspace for the user
aimgr user assign <email> --provider <providers>

# Example:
aimgr user assign john@example.com --provider openai
```

### Remove User

```bash
# remove member from provider
aimgr user remove <email> --provider <providers>

# If no optional provider is provided, all providers will be removed.
# Example:
aimgr user remove john@example.com --provider openai
# Example: multiple providers
aimgr user remove john@example.com --provider openai,anthropic
```
