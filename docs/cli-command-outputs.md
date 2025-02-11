# AI Manager CLI Command Outputs

## User Management Commands

### user add

```bash
$ aimgr user add --email john.doe@euri.com --name "John Doe" --provider openai,openrouter

✓ User created successfully: John Doe (john.doe@euri.com)

Provider List (john.doe@euri.com):

| Provider   | ApiKey (name) | ApiKey (value)    | Credits ($/Month)   |
|------------|---------------|-------------------|---------------------|
| openrouter | api-key-2     | sk-1234567890     | 0.25 of 10          |

________________________________________________________________________________

"ALTERNATIVE" (if no api key is provided):

| Provider   | ApiKey (name) | ApiKey (value)    | Credits ($/Month)   |
|------------|---------------|-------------------|---------------------|
|            |               |                   |                     |
```

### user list

```bash
$ aimgr user list

User List:

| Email              | Name       | Providers                |
|--------------------|------------|--------------------------|
| john.doe@euri.com  | John Doe   | (2) openai, anthropic    |
| jane.doe@euri.com  | Jane Doe   | (1) openai               |
| bob.smith@euri.com | Bob Smith  | (2) anthropic, openrouter|
```

### user info

```bash
$ aimgr user info john.doe@euri.com

User Info:

| Email              | Name       | Providers                         |
|--------------------|------------|-----------------------------------|
| john.doe@euri.com  | John Doe   | (3) openrouter, openai, anthropic |

Provider List (john.doe@euri.com):

| Provider   | ApiKey (name) | ApiKey (value)    | Credits ($/Month)   |
|------------|---------------|-------------------|---------------------|
| openrouter | api-key-2     | sk-1234567890     | 0.25 of 10          |
| openrouter | api-key-1     | sk-1519959890     | 0.25 of 10          |
| anthropic  | api-key-1     | sk-5919159181     | 0.25 of 10          |
| openai     | api-key-1     | sk-1236527832     | 0.25 of 10          |
```

### user remove

```bash
$ aimgr user remove john.doe@euri.com --provider openai

✓ Provider "openai" removed successfully from "john.doe@euri.com"

User Info:

| Email              | Name       | Providers                   |
|--------------------|------------|-----------------------------|
| john.doe@euri.com  | John Doe   | (2) openrouter, anthropic   |

Provider List (john.doe@euri.com):

| Provider   | ApiKey (name) | ApiKey (value)    | Credits ($/Month)   |
|------------|---------------|-------------------|---------------------|
| openrouter | api-key-2     | sk-1234567890     | 0.25 of 10          |
| openrouter | api-key-1     | sk-1519959890     | 0.25 of 10          |
| anthropic  | api-key-1     | sk-5919159181     | 0.25 of 10          |
```

### user add-key

```bash
$ aimgr user add-key john.doe@euri.com --provider openai

✓ API key (openai) added successfully to "john.doe@euri.com"

Provider List (john.doe@euri.com):

| Provider   | ApiKey (name) | ApiKey (value)    | Credits ($/Month)   |
|------------|---------------|-------------------|---------------------|
| openrouter | api-key-2     | sk-1234567890     | 0.25 of 10          |
| openrouter | api-key-1     | sk-1519959890     | 0.25 of 10          |
| anthropic  | api-key-1     | sk-5919159181     | 0.25 of 10          |
| openai     | api-key-1     | sk-1236527832     | 0.00 of 10          |
```

### user set-limit

```bash
$ aimgr user set-limit john.doe@euri.com --provider openai --limit 100

✓ Credit limit (openai) updated successfully for "john.doe@euri.com"

Provider List (john.doe@euri.com):

| Provider   | ApiKey (name) | ApiKey (value)    | Credits ($/Month)   |
|------------|---------------|-------------------|---------------------|
| openrouter | api-key-2     | sk-1234567890     | 0.25 of 10          |
| openrouter | api-key-1     | sk-1519959890     | 0.25 of 10          |
| anthropic  | api-key-1     | sk-5919159181     | 0.25 of 10          |
| openai     | api-key-1     | sk-1236527832     | 0.00 of 100         |
```

## Provider Management Commands

### provider list

```bash
$ aimgr provider list

Available Providers:

| Provider   | Total Credits ($/Month)  |
|------------|--------------------------|
| openai     | 0.50 of 100              |
| anthropic  | 35.00 of 100             |
| openrouter | 15.25 of 100             |
```

### provider set-limit

```bash
$ aimgr provider set-limit --provider openai --limit 500

✓ Provider limit (openai) updated successfully for all users
```
