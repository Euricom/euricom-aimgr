import { Invite } from '@/domain/invite';
import { User } from '@/domain/user';
import { BaseAPIClient } from '@/utils/base-api-client';
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

interface DeleteUserDto {
  id: string;
  type: 'user_deleted';
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

  async getUserInfo(email: string): Promise<User | undefined> {
    // 1. Look if the user is a member of the provider
    const memberFromProvider = await this.getMemberFromProvider(email);
    if (!memberFromProvider) return undefined;

    // 2. Get the workspaces
    const workspacesResponse = await this.client.get<ListDto<WorkspaceDto>>('/workspaces?limit=100');

    // 3. Check if there is a workspace with the same name as the user name
    const userWorkspace = workspacesResponse.data.find(workspace => workspace.name === memberFromProvider.userName);

    if (!userWorkspace) return undefined;

    // 4. Just to be sure, check if the user is a member of the workspace
    const usersInWorkspaceResponse = await this.client.get<ListDto<WorkspaceMemberDto>>(
      `/workspaces/${userWorkspace.id}/members`
    );
    const isUserMember = usersInWorkspaceResponse.data.some(user => user.user_id === memberFromProvider.userId);
    if (!isUserMember) return undefined;

    const apiKeysResponses = await this.client.get<ListDto<ApiKeyDto>>(
      `/api_keys?limit=100&workspace_id=${userWorkspace.id}&status=active`
    );

    const apiKeys: ApiKeyDto[] = apiKeysResponses.data;

    return {
      email,
      name: memberFromProvider.userName,
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

  async getUsers(): Promise<User[]> {
    const organizationMembers = await this.client.get<ListDto<UserDto>>('/users?limit=100');

    return organizationMembers.data.map(user => ({
      email: user.email,
      name: user.name,
      providers: [{ name: this.getName() }],
    }));
  }

  async addUser(email: string): Promise<boolean> {
    const userExists = await this.isUserMemberOfProvider(email);

    if (!userExists) {
      await this.client.post<InviteUserDto>('/invites', { email, role: 'user' });
      return true; // User invited successfully
    }

    return false; // User already exists
  }

  async assignUser(userId: string, userName: string): Promise<boolean> {
    const createWorkspaceResponse = await this.client.post<WorkspaceDto>('/workspaces', {
      name: userName,
    });

    if (createWorkspaceResponse.id) {
      await this.client.post<WorkspaceMemberDto>(`/workspaces/${createWorkspaceResponse.id}/members`, {
        user_id: userId,
        workspace_role: 'workspace_developer',
      });
      return true;
    }

    return false;
  }

  async removeUser(userId: string, userName: string): Promise<boolean> {
    // TODO: check if the user has a workspace
    const workspacesResponse = await this.client.get<ListDto<WorkspaceDto>>('/workspaces?limit=100');
    const userWorkspace = workspacesResponse.data.find(workspace => workspace.name === userName);

    if (userWorkspace) {
      // TODO: verify if the user is a member of the workspace
      const usersInWorkspaceResponse = await this.client.get<ListDto<WorkspaceMemberDto>>(
        `/workspaces/${userWorkspace.id}/members`
      );
      const isUserMember = usersInWorkspaceResponse.data.some(user => user.user_id === userId);
      if (isUserMember) {
        // TODO: remove the user from the workspace
        await this.client.post<WorkspaceDto>(`/workspaces/${userWorkspace.id}/archive`, {});
      }
    }

    // Now remove the user
    const deleteUserResponse = await this.client.delete<DeleteUserDto>(`/users/${userId}`);
    if (deleteUserResponse.id) {
      return true;
    }

    return false;
  }

  async getMemberFromProvider(
    email: string
  ): Promise<{ providerName: string; userName: string; userId: string } | undefined> {
    const { data } = await this.client.get<ListDto<UserDto>>(`/users?email=${email}`);
    const user = data.find(({ email: userEmail }) => userEmail === email);
    return user
      ? {
          providerName: this.getName(),
          userName: user.name,
          userId: user.id,
        }
      : undefined;
  }

  async isUserInvitePending(email: string): Promise<boolean> {
    const invitesResponse = await this.client.get<ListDto<InviteUserDto>>('/invites?limit=100');
    // TODO: check if the email is in the invites list, and if it is status pending, then we need to return the invite url
    const invite = invitesResponse.data.find(invite => invite.email === email && invite.status === 'pending');

    return invite !== undefined;
  }

  async isUserMemberOfProvider(email: string): Promise<boolean> {
    const { data } = await this.client.get<ListDto<UserDto>>(`/users?email=${email}`);
    return data.length > 0; // More concise check for membership
  }

  async isUserAssignedToProvider(userId: string, userName: string): Promise<boolean> {
    const workspacesResponse = await this.client.get<ListDto<WorkspaceDto>>('/workspaces?limit=100');
    const userWorkspace = workspacesResponse.data.find(workspace => workspace.name === userName);
    if (!userWorkspace) return false;
    const usersInWorkspaceResponse = await this.client.get<ListDto<WorkspaceMemberDto>>(
      `/workspaces/${userWorkspace.id}/members`
    );
    return usersInWorkspaceResponse.data.some(user => user.user_id === userId);
  }

  async getInvites(): Promise<Invite[]> {
    const invitesResponse = await this.client.get<ListDto<InviteUserDto>>('/invites?limit=100');
    return invitesResponse.data.map(invite => ({
      id: invite.id,
      email: invite.email,
      status: invite.status as 'pending' | 'accepted' | 'rejected',
      provider: this.getName(),
    }));
  }
}
