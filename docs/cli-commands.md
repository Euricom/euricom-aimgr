# AI Manager CLI Commands

## Basic Commands

```bash
# show help
aimgr --help

# show version
aimgr --version
```

## User Management

### Create User

```bash
# create a new user
aimgr user add --email john.doe@euri.com \
               --name "John Doe" \
               [--provider openai,anthropic,openrouter]

# Required Options:
#   -e, --email <email>      User's email address
#   -n, --name <name>        User's name
# Optional Options:
#   -p, --provider <providers>  Comma-separated list of providers (openai,anthropic,openrouter)

TODO: correct usage, argument and/or options
TODO: do we need this extra info? probably not

# Usage: user add [options] 
# 
# Add one or more provider account for a user
#
# Options:
#   -e, --email <email>         User's email address
#   -n, --name <name>           User's name
#   -p, --provider [providers]  Optional Comma-separated list of ...
```

### List Users

```bash
# list all users
aimgr user list

# filter users by email
aimgr user list --filter john

# Optional Options:
#   -f, --filter <filter>    Filter users by email
```

### User Details

```bash
# show detailed user info
aimgr user info john.doe@euri.com

# Arguments:
#   <email>    User's email address
```

### Remove User Provider(s)

```bash
# remove provider(s) for a user
aimgr user remove john.doe@euri.com

# remove specific provider(s) for a user
aimgr user remove john.doe@euri.com --provider openai,anthropic

# Arguments:
#   <email>    User's email address
# Optional Options:
#   -p, --provider <providers>  Specific provider(s) to remove (if not specified, removes all)
#                              Comma-separated list of providers (openai,anthropic,openrouter)
```

### Add API Keys

```bash
# add API key(s) for a user
aimgr user add-key john.doe@euri.com --provider openai,anthropic,openrouter

# Arguments:
#   <email>    User's email address
# Required Options:
#   -p, --provider <providers>  Comma-separated list of providers (openai,anthropic,openrouter)
```

### Set User Provider Limit

```bash
# set credit limit for a user's provider
aimgr user set-limit john.doe@euri.com --provider openai --limit 10

# Arguments:
#   <email>    User's email address
# Required Options:
#   -p, --provider <provider>   Provider name
#   -l, --limit <limit>        Credit limit
```

## Provider Management

### List Providers

```bash
# list all providers
aimgr provider list
```

### Set Provider Limit

```bash
# set limit for all users for a provider
aimgr provider set-limit --provider openai --limit 10

# Required Options:
#   -p, --provider <providers>  Comma-separated list of providers (openai,anthropic,openrouter)
#   -l, --limit <limit>        Credit limit
```
