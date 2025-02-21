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

interface UserDto {
  id: string;
  type: 'user';
  email: string;
  name: string;
  role: string;
  added_at: string;
}

interface InviteUserDto {
  id: string;
  type: 'invite';
  email: string;
  role: string;
  invited_at: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'expired';
}

interface WorkspaceMemberDto {
  type: 'workspace_member';
  user_id: string;
  workspace_id: string;
  workspace_role: string;
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
    const organizationMembersResponse = await this.client.get<ListDto<UserDto>>('/users?limit=100');

    const users = organizationMembersResponse.data.map(user => ({
      email: user.email,
      name: user.name,
      providers: [{ name: this.getName() }],
    }));

    return users;
  }

  async isUserMemberOfProvider(email: string): Promise<boolean> {
    const organizationMembersResponse = await this.client.get<ListDto<UserDto>>('/users?limit=100');
    return organizationMembersResponse.data.some(user => user.email.toLowerCase() === email);
  }

  async assignUser(email: string): Promise<boolean> {
    const organizationMembersResponse = await this.client.get<ListDto<UserDto>>('/users?limit=100');
    const user = organizationMembersResponse.data.find(user => user.email === email);

    if (!user) return false;

    const isAlreadyAssigned = await this.isUserAssignedToProvider(email);
    if (isAlreadyAssigned) return true;

    // TODO: if not already assigned we need to create a workspace
    const createWorkspaceResponse = await this.client.post<WorkspaceDto>('/workspaces', {
      name: user.name,
    });

    await this.client.post<WorkspaceMemberDto>(`/workspaces/${createWorkspaceResponse.id}/members`, {
      user_id: user.id,
      workspace_role: 'workspace_developer',
    });

    return true;
  }

  async addUser(email: string): Promise<boolean> {
    const organizationMembersResponse = await this.client.get<ListDto<UserDto>>('/users?limit=100');
    const userExists = organizationMembersResponse.data.some(user => user.email.toLowerCase() === email);

    if (!userExists) {
      await this.client.post<InviteUserDto>('/invites', { email, role: 'user' });
      return true; // User invited successfully
    }
    return false; // User already exists
  }

  async isUserInvitePending(email: string): Promise<boolean> {
    const invitesResponse = await this.client.get<ListDto<InviteUserDto>>('/invites?limit=100');
    // TODO: check if the email is in the invites list, and if it is status pending, then we need to return the invite url
    const invite = invitesResponse.data.find(invite => invite.email === email && invite.status === 'pending');
    return invite !== undefined;
  }

  private async isUserAssignedToProvider(email: string): Promise<boolean> {
    const workspacesResponse = await this.client.get<ListDto<WorkspaceDto>>('/workspaces?limit=100');
    // TODO: check if the user (email) is assigned to any of the workspaces , use the normalizeEmail function to normalize the email and compare it with the workspace name
    const emailParts = normalizeEmail(email);
    const userWorkspace = workspacesResponse.data.find(workspace => {
      const workspaceName = normalizeString(workspace.name);
      return emailParts.every(part => workspaceName.includes(part));
    });

    if (!userWorkspace) return false;

    // TODO: double check if the user is assigned to the workspace by fetching the users in the workspace and checking if the email is in the list
    const usersInWorkspaceResponse = await this.client.get<ListDto<WorkspaceMemberDto>>(
      `/workspaces/${userWorkspace.id}/members?limit=20`
    );

    // TODO: we get workspace_members with user_id, we need to fetch the get user for each user_id and check if the email is in the list
    const users: UserDto[] = await Promise.all(
      usersInWorkspaceResponse.data.map(async user => {
        const userResponse = await this.client.get<UserDto>(`/users/${user.user_id}`);
        return userResponse;
      })
    );

    return users.some(user => user.email.toLowerCase() === email);
  }
}
