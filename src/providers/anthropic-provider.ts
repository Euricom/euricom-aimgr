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
  status: 'accepted' | 'expired' | 'pending' | 'deleted';
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

  async getUserDetails(email: string): Promise<User | undefined> {
    // 1. Get the user member from provider
    const userMemberFromProvider = await this.getUserFromProvider(email);
    if (!userMemberFromProvider) return undefined;

    const response: User = {
      name: userMemberFromProvider.userName,
      email,
      providers: [{ name: this.getName() }],
    };

    // 2. Get the workspace
    const userWorkspace = await this.getUserWorkspace(userMemberFromProvider.userId, userMemberFromProvider.userName);

    if (userWorkspace) {
      const apiKeys = await this.getWorkspaceApiKeys(userWorkspace.workspaceId);
      response.providers[0] = {
        ...response.providers[0],
        creditsUsed: 0,
        setLimitUrl: `https://console.anthropic.com/settings/workspaces/${userWorkspace.workspaceId}/limits`,
        apiKeys,
        workspaceUrl: userWorkspace.workspaceUrl,
      };
    }

    return response;
  }

  async getUsers(): Promise<User[]> {
    const users = await this.paginate<UserDto>('/users');
    return users.map(user => ({
      email: user.email,
      name: user.name,
      providers: [{ name: this.getName() }],
    }));
  }

  async getUserFromProvider(
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

  async getUserPendingInvite(email: string): Promise<Invite | undefined> {
    const invitesResponse = await this.paginate<InviteUserDto>('/invites');
    // TODO: check if the email is in the invites list, and if it is status pending, then we need to return the invite url
    const invite = invitesResponse.find(invite => invite.email === email && invite.status === 'pending');
    if (!invite) return undefined;

    return {
      id: invite.id,
      email: invite.email,
      status: invite.status,
      provider: this.getName(),
      invitedAt: new Date(invite.invited_at),
      expiresAt: new Date(invite.expires_at),
    };
  }

  async getInvites(email?: string): Promise<Invite[]> {
    const invitesResponse = await this.paginate<InviteUserDto>('/invites');
    const filteredInvites = email ? invitesResponse.filter(invite => invite.email === email) : invitesResponse;

    return filteredInvites.map(invite => ({
      id: invite.id,
      email: invite.email,
      status: invite.status,
      provider: this.getName(),
      invitedAt: new Date(invite.invited_at),
      expiresAt: new Date(invite.expires_at),
    }));
  }

  async getUserWorkspace(
    userId: string,
    userName: string
  ): Promise<{ workspaceName: string; workspaceId: string; workspaceUrl: string } | undefined> {
    const workspacesResponse = await this.paginate<WorkspaceDto>('/workspaces', 100);
    const userWorkspace = workspacesResponse.find(workspace => workspace.name === userName);
    if (!userWorkspace) return undefined;

    // TODO: check if the user is a member of the workspace using the isUserAssignedToProvider method
    const isUserMember = await this.isUserAssignedToWorkspace(userWorkspace.id, userId);
    if (!isUserMember) return undefined;

    return {
      workspaceName: userWorkspace.name,
      workspaceId: userWorkspace.id,
      workspaceUrl: `https://console.anthropic.com/settings/workspaces/${userWorkspace.id}`,
    };
  }

  async getWorkspaceApiKeys(workspaceId: string): Promise<{ name: string; keyHint: string }[]> {
    const apiKeysResponses = await this.client.get<ListDto<ApiKeyDto>>(
      `/api_keys?limit=100&workspace_id=${workspaceId}&status=active`
    );
    if (!apiKeysResponses.data) return [];
    return apiKeysResponses.data.map(key => ({
      name: key.name,
      keyHint: key.partial_key_hint,
    }));
  }

  async addUser(email: string): Promise<boolean> {
    const inviteResponse = await this.client.post<InviteUserDto>('/invites', { email, role: 'user' });
    return inviteResponse.id !== undefined;
  }

  async assignUserToWorkspace(userId: string, workspaceName: string): Promise<boolean> {
    const createWorkspaceResponse = await this.client.post<WorkspaceDto>('/workspaces', {
      name: workspaceName,
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

  async removeUser(userId: string): Promise<boolean> {
    // Now remove the user
    const deleteUserResponse = await this.client.delete<DeleteUserDto>(`/users/${userId}`);
    if (deleteUserResponse.id) {
      return true;
    }

    return false;
  }

  async removeWorkspace(workspaceId: string): Promise<boolean> {
    const archiveWorkspaceResponse = await this.client.post<WorkspaceDto>(`/workspaces/${workspaceId}/archive`, {});
    return archiveWorkspaceResponse.id !== undefined;
  }

  private async paginate<T>(url: string, limit = 50): Promise<T[]> {
    let allItems: T[] = [];
    let lastId: string | undefined;
    let response: ListDto<T>; // Declare response outside the loop

    do {
      response = await this.client.get<ListDto<T>>(`${url}?limit=${limit}${lastId ? `&after_id=${lastId}` : ''}`);

      // Return early if the response is invalid
      if (!response || !response.data) return allItems;

      allItems.push(...response.data);
      lastId = response.last_id;

      // Log the pagination status
    } while (response.has_more && lastId);

    return allItems;
  }

  private async isUserAssignedToWorkspace(workspaceId: string, userId: string): Promise<boolean> {
    const usersInWorkspaceResponse = await this.client.get<ListDto<WorkspaceMemberDto>>(
      `/workspaces/${workspaceId}/members`
    );
    return usersInWorkspaceResponse.data.some(user => user.user_id === userId);
  }
}
