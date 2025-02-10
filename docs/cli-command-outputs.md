# AI Manager CLI Command Outputs

## User Management Commands

### user add

```code
$ aimgr user add --email john.doe@euri.com --name "John Doe" --provider openai,anthropic

✓ User created successfully: John Doe (john.doe@euri.com) 


TODO: review this output

| Provider   | API Keys          | Value              | Credits        |
| ---------- | ----------------- | ------------------ | -------------- |
| OpenAI     | Cursor            | xxxxxxxxxxxxxxxxxx | $0.1 of $5.0/m |
| Anthropic  | Default           | xxxxxxxxxxxxxxxxxx | $1.5 of $5.0/m |
| OpenRouter | john.doe@euri.com | xxxxxxxxxxxxxxxxxx | $5.2 of $10    |

TODO: Example for no keys (disabled, removed)

| Provider | API Keys | Value | Credits |
| -------- | -------- | ----- | ------- |
| -        | -        | -     | -       |

User Details:
┌──────────────────┬──────────────────────┐
│ Email            │ john.doe@euri.com    │
├──────────────────┼──────────────────────┤
│ Name             │ John Doe             │
├──────────────────┼──────────────────────┤
│ Active Providers │ openai, anthropic    │
└──────────────────┴──────────────────────┘
```

### user list

```bash
$ aimgr user list

Users:
┌────────────────────┬────────────┬───────────────────────┬─────────┐
│ Email              │ Name       │ Providers             │ Status  │
├────────────────────┼────────────┼───────────────────────┼─────────┤
│ john.doe@euri.com  │ John Doe   │ openai, anthropic     │ Active  │
│ jane.doe@euri.com  │ Jane Doe   │ openai                │ Active  │
│ bob.smith@euri.com │ Bob Smith  │ anthropic, openrouter │ Active  │
└────────────────────┴────────────┴───────────────────────┴─────────┘

$ aimgr user list --filter john

Users:
┌────────────────────┬────────────┬───────────────────┬─────────┐
│ Email              │ Name       │ Providers         │ Status  │
├────────────────────┼────────────┼───────────────────┼─────────┤
│ john.doe@euri.com  │ John Doe   │ openai, anthropic │ Active  │
└────────────────────┴────────────┴───────────────────┴─────────┘
```

### user info

```bash
$ aimgr user info john.doe@euri.com

TODO: idem as user create

User Details:
┌──────────────┬──────────────────────┐
│ Email        │ john.doe@euri.com    │
├──────────────┼──────────────────────┤
│ Name         │ John Doe             │
├──────────────┼──────────────────────┤
│ Status       │ Active               │
└──────────────┴──────────────────────┘

Provider Details:
┌───────────┬──────────┬───────────────┬────────────────┐
│ Provider  │ Status   │ Credit Limit  │ Credits Used   │
├───────────┼──────────┼───────────────┼────────────────┤
│ openai    │ Active   │ 1000          │ 250            │
│ anthropic │ Active   │ 500           │ 100            │
└───────────┴──────────┴───────────────┴────────────────┘
```

### user remove

```bash
$ aimgr user remove john.doe@euri.com --provider openai

✓ Provider removed successfully

TODO: idem as user create, info


Updated Provider List:
┌───────────┬──────────┐
│ Provider  │ Status   │
├───────────┼──────────┤
│ anthropic │ Active   │
└───────────┴──────────┘
```

### user add-key

```bash
$ aimgr user add-key john.doe@euri.com --provider openai

✓ API key added successfully

TODO: idem as user create, info

Provider Status:
┌───────────┬──────────┬────────────────┐
│ Provider  │ Status   │ Last Updated   │
├───────────┼──────────┼────────────────┤
│ openai    │ Active   │ Just now       │
└───────────┴──────────┴────────────────┘
```

### user set-limit

```bash
$ aimgr user set-limit john.doe@euri.com --provider openai --limit 1000

✓ Credit limit updated successfully

TODO: idem as user create, info

Updated Provider:
┌───────────┬──────────┬───────────────┬────────────────┐
│ Provider  │ Status   │ Credit Limit  │ Credits Used   │
├───────────┼──────────┼───────────────┼────────────────┤
│ openai    │ Active   │ 1000          │ 250            │
└───────────┴──────────┴───────────────┴────────────────┘
```

## Provider Management Commands

### provider list

```bash
$ aimgr provider list

TODO: active user is not mandatory

Available Providers:
┌────────────┬────────────────┬─────────────────┐
│ Provider   │ Default Limit  │ Active Users    │
├────────────┼────────────────┼─────────────────┤
│ openai     │ 1000           │ 15              │
│ anthropic  │ 500            │ 8               │
│ openrouter │ 200            │ 3               │
└────────────┴────────────────┴─────────────────┘
```

### provider set-limit

```bash
$ aimgr provider set-limit --provider openai --limit 1000

✓ Provider limit updated successfully

TODO: active user is not mandatory, output idem as provider list

Updated Provider:
┌────────────┬────────────────┬─────────────────┐
│ Provider   │ Default Limit  │ Affected Users  │
├────────────┼────────────────┼─────────────────┤
│ openai     │ 1000           │ 15              │
└────────────┴────────────────┴─────────────────┘
```
