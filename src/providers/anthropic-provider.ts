import { Provider } from '@/domain/provider';
import { User } from '@/domain/user';
import { ofetch } from 'ofetch';
import { AIProvider } from './ai-provider';

// Anthropic API response types
interface WorkspaceDto {
  id: string;
  type: 'workspace';
  name: string;
  created_at: string;
  archived_at?: string;
  display_color: string;
}

interface WorkspaceMemberDto {
  type: 'workspace_member';
  user_id: string;
  workspace_id: string;
  workspace_role: 'workspace_user' | 'workspace_developer' | 'workspace_admin' | 'workspace_billing';
}

interface UserDto {
  id: string;
  type: 'user';
  email: string;
  name: string;
  role: 'user' | 'developer' | 'billing' | 'admin';
  added_at: string;
}

interface ListDto<T> {
  data: T[];
  has_more: boolean;
  first_id?: string;
  last_id?: string;
}

class AnthropicClient {
  private baseURL = 'https://api.anthropic.com/v1/organizations';

  constructor(private apiKey: string) {}

  // TODO: improve see code rabbit
  get<T>(url: string) {
    return ofetch<T>(url, {
      baseURL: this.baseURL,
      headers: {
        'x-api-key': this.apiKey,
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
    });
  }
}

export class AnthropicProvider extends AIProvider {
  private client: AnthropicClient;

  constructor() {
    super();
    // TODO: use type safe env
    if (!process.env.ANTHROPIC_ADMIN_KEY) {
      throw new Error('ANTHROPIC_ADMIN_KEY is not set');
    }
    this.client = new AnthropicClient(process.env.ANTHROPIC_ADMIN_KEY);
  }

  getName(): string {
    return 'anthropic';
  }

  async fetchUserInfo(email: string): Promise<Provider> {
    // Implementation for single user info - can be added later
    return {
      name: this.getName(),
      creditsLimit: 0,
      creditsUsed: 0,
      apiKeys: [],
    };
  }

  async fetchUsers(): Promise<User[]> {
    // 1. Get all workspaces
    const workspacesResponse = await this.client.get<ListDto<WorkspaceDto>>('/workspaces');

    // 2. Get all workspace members in parallel
    const memberResponses = await Promise.all(
      workspacesResponse.data.map(workspace =>
        this.client.get<ListDto<WorkspaceMemberDto>>(`/workspaces/${workspace.id}/members`)
      )
    );

    // 3. Collect all user IDs
    const userIds = new Set<string>(memberResponses.flatMap(response => response.data.map(member => member.user_id)));

    // 4. Get user details for all workspace members
    const usersResponse = await this.client.get<ListDto<UserDto>>('/users');

    // 5. Filter users to only those who are workspace members
    const activeUsers = usersResponse.data.filter(user => userIds.has(user.id));

    // 6. Map to UserData format
    return activeUsers.map(user => ({
      email: user.email,
      name: user.name,
      providers: [
        {
          name: this.getName(),
          creditsLimit: 0,
          creditsUsed: 0,
          apiKeys: [],
        },
      ],
    }));
  }
}
