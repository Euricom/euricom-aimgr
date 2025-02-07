# euricom-ai-provider-mgr

Command set

```bash
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