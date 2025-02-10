# euricom-aimgr

## Technical requiremnts

Folder structure

```
bin/
├── aimgr.js
src/
├── commands/
│   ├── list.ts
│   ├── create.ts
├── providers/
│   ├── openai.ts
│   ├── anthropic.ts
│   ├── open-router.ts
├── utils/
│   ├── file-utils.ts
│   ├── logger.ts
├── cli.ts
```

Dev Tools

- linting: oxlint
- formatting: prettier
- language: typescript
- package manager: pnpm
- build: tsup
- node: >=18
- spelling: cspell

Libraries

- CLI Commands: cac (or commander & inquirer)
- Colors: picocolors (or chalk)
- Spinners: cli-spinners
- Console: consola (or etter-console)
- Console Tables: Table (cli-table3)
- Debug log: debug
- Run TS: tsx (geen tsnode)

## CLI

```bash
# install
npm install https://github.com/euricom/aimgr.git --global
# or
npm install github:euricom/aimgr --global

## Help & Version
aimgr --help
aimgr --version

# help & usage
aimgr --version
aimgr --help

# create a new user
aimgr user add --email john.doo@euri.com \
               --name "John Doo" \
               --provider openai, anthropic

# give a list of all users (no filter)
aimgr user list

# give a list of users based on a filter on the email
aimgr user list --filter john

# give all info of a user
aimgr user info john.doo@euri.com

# disable API keys (open AI and remove Anthropic & openRouter keys)
aimgr user disable john.doo@euri.com

# remove all providers for a user
aimgr user remove john.doo@euri.com

# remove single provider for a user
aimgr user remove john.doo@euri.com --provider openai

# create a API key for a user (open router)
aimgr user add-key john.doo@euri.com

# list all providers
aimgr provider list

# print the available credit of a provider
aimgr provider credit --provider openrouter
```

## Info

CLI Template/Sample Project

- https://github.com/emosheeep/cli-template
- https://github.com/egoist/tsup/blob/main/package.json
