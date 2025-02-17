Master Plan: Console App for API Key & User Management

TODO: can go into root

### Technology Stack

- Node.js with Express.js (Backend server)
- TypeScript (Strict typing & better development experience)
- Commander.js (commander & @commander-js/extra-typings) (CLI tool)
- Microsoft Graph API (OpenID) (Fetch users from your org)
- Axios (For OpenAI & Graph API requests)
- dotenv (For managing environment variables)
- JWT (For authentication if needed)

### Core Features

1. User Management via OpenID (Graph API)
   - Fetch all users (email, name, active/inactive, credits used, credits left)
   - Filter users by email (contains keyword)
   - Get user details (email, provider, api keys, usage, limits)
   - Set user credit limits
   - Enable/disable users (disables/removes API keys)
   - Remove users
2. API Key Management
   - Create an API key for a user (email, provider)
   - List a user’s API keys
   - Remove API keys when disabling a user
3. Project & Group Management
   - Create a project
   - Assign users to a project
   - List projects and users
   - Remove users from projects
