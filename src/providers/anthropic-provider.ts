import consola from 'consola';
import { ofetch } from 'ofetch';
import { BaseProvider, ProviderData, UserData } from './base-provider';

// Anthropic API response types
interface AnthropicWorkspace {
  id: string;
  type: 'workspace';
  name: string;
  created_at: string;
  archived_at: string | null;
  display_color: string;
}

interface AnthropicWorkspaceMember {
  type: 'workspace_member';
  user_id: string;
  workspace_id: string;
  workspace_role:
    | 'workspace_user'
    | 'workspace_developer'
    | 'workspace_admin'
    | 'workspace_billing';
}

interface AnthropicUser {
  id: string;
  type: 'user';
  email: string;
  name: string;
  role: 'user' | 'developer' | 'billing' | 'admin';
  added_at: string;
}

interface AnthropicListResponse<T> {
  data: T[];
  has_more: boolean;
  first_id: string | null;
  last_id: string | null;
}

export class AnthropicProvider extends BaseProvider {
  private readonly baseUrl = 'https://api.anthropic.com/v1/organizations';
  private readonly headers: Record<string, string>;

  constructor(apiKey: string) {
    super(apiKey);

    // TODO: better to create Anthropic API client and use that
    this.headers = {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01', // Use appropriate version
    };
  }

  getName(): string {
    return 'anthropic';
  }

  async fetchUserInfo(email: string): Promise<ProviderData> {
    // Implementation for single user info - can be added later
    return {
      name: this.getName(),
      creditsLimit: 0,
      creditsUsed: 0,
      apiKeys: [],
    };
  }

  async fetchUsers(): Promise<UserData[]> {
    try {
      // 1. Get all workspaces
      const workspacesResponse = await ofetch<AnthropicListResponse<AnthropicWorkspace>>(
        '/workspaces',
        {
          baseURL: this.baseUrl,
          headers: this.headers,
        }
      );

      // 2. Get all workspace members
      const userIds = new Set<string>();
      for (const workspace of workspacesResponse.data) {
        const membersResponse = await ofetch<AnthropicListResponse<AnthropicWorkspaceMember>>(
          `/workspaces/${workspace.id}/members`,
          {
            baseURL: this.baseUrl,
            headers: this.headers,
          }
        );
        membersResponse.data.forEach(member => userIds.add(member.user_id));
      }

      // 3. Get user details for all workspace members
      const usersResponse = await ofetch<AnthropicListResponse<AnthropicUser>>('/users', {
        baseURL: this.baseUrl,
        headers: this.headers,
      });

      // 4. Filter users to only those who are workspace members
      const activeUsers = usersResponse.data.filter(user => userIds.has(user.id));

      // 5. Map to UserData format
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
    } catch (error) {
      // TODO: log error only on top level
      consola.error('Error fetching Anthropic users:', error);
      throw error;
    }
  }
}
