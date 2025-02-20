import { User } from '@/domain/user';
import { BaseAPIClient } from '@/utils/base-api-client';
import { normalizeEmail, normalizeString } from '@/utils/string-utils';
import invariant from 'tiny-invariant';
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

interface ListDto<T> {
  data: T[];
  has_more: boolean;
  first_id?: string;
  last_id?: string;
}

interface ApiKeyDto {
  id: string;
  type: 'api_key';
  name: string;
  workspace_id: string;
  created_at: string;
  created_by: {
    id: string;
    type: 'user';
  };
  partial_key_hint: string;
  status: 'active' | 'inactive' | 'archived';
}

class AnthropicClient extends BaseAPIClient {
  constructor(apiKey: string, version = '2023-06-01') {
    super('https://api.anthropic.com/v1/organizations', {
      'x-api-key': apiKey,
      'anthropic-version': version,
    });
  }
}

export class AnthropicProvider extends AIProvider {
  private client: AnthropicClient;

  constructor() {
    super();
    invariant(process.env.ANTHROPIC_ADMIN_KEY, 'ANTHROPIC_ADMIN_KEY is not set');
    this.client = new AnthropicClient(process.env.ANTHROPIC_ADMIN_KEY);
  }

  getName(): string {
    return 'anthropic';
  }

  async fetchUserInfo(email: string): Promise<User> {
    // 1. Get all workspaces
    const workspacesResponse = await this.client.get<ListDto<WorkspaceDto>>('/workspaces?limit=100');

    // 2. Look in the workspaces for a workspace that has a name resembling the email
    const emailParts = normalizeEmail(email);
    const userWorkspace = workspacesResponse.data.find(workspace => {
      const workspaceName = normalizeString(workspace.name);
      return emailParts.every(part => workspaceName.includes(part));
    });

    if (!userWorkspace) {
      return {
        email,
        name: '',
        providers: [],
      };
    }

    const apiKeysResponses = await this.client.get<ListDto<ApiKeyDto>>(
      `/api_keys?limit=100&workspace_id=${userWorkspace.id}&status=active`
    );

    const apiKeys: ApiKeyDto[] = apiKeysResponses.data;

    return {
      email,
      name: userWorkspace.name.toLowerCase(), // Assuming name is not available, adjust as needed
      providers: [
        {
          creditsUsed: 0,
          setLimitUrl: `https://console.anthropic.com/settings/workspaces/${userWorkspace.id}/limits`,
          name: this.getName(),
          apiKeys: apiKeys.map(key => ({
            name: key.name,
            keyHint: key.partial_key_hint,
          })),
        },
      ],
    };
  }

  async fetchUsers(): Promise<User[]> {
    // 1. Get all workspaces
    const workspacesResponse = await this.client.get<ListDto<WorkspaceDto>>('/workspaces?limit=100');

    // 2. Get all workspaces and use the workspace name to generate the user email & name
    const users: { name: string; email: string }[] = workspacesResponse.data.map(workspace => ({
      name: workspace.name.toLowerCase(),
      email:
        `${workspace.name.split(' ')[0].toLowerCase()}.${workspace.name.split(' ').slice(1).join('')}`.toLowerCase() +
        '@euri.com',
    }));

    return users.map(user => ({
      email: user.email,
      name: user.name,
      providers: [{ name: this.getName() }],
    }));
  }
}
