import { Invite } from '@/domain/invite';
import { User } from '@/domain/user';
import { BaseAPIClient } from '@/utils/base-api-client';
import { getEndOfCurrentMonth, getStartOfCurrentMonth } from '@/utils/dates-utils';
import invariant from 'tiny-invariant';
import { AIProvider } from './ai-provider';

interface ProjectDto {
  id: string;
  object: 'organization.project';
  name: string;
  created_at: number;
  archived_at?: number;
  status: 'active' | 'archived';
}

interface ListDto<T> {
  object: 'list';
  data: T[];
  first_id: string;
  last_id: string;
  has_more: boolean;
}

interface ProjectApiKeyDto {
  object: 'organization.project.api_key';
  redacted_value: string;
  name: string;
  created_at: number;
  id: string;
  owner: {
    type: 'user';
    user: {
      object: 'organization.project.user';
      id: string;
      name: string;
      email: string;
      role: string;
      created_at: number;
    };
  };
}

interface CostResult {
  object: 'organization.costs.result';
  amount: {
    value: number;
    currency: 'usd';
  };
  project_id?: string;
}

interface CostBucket {
  object: 'bucket';
  start_time: number;
  end_time: number;
  results: CostResult[];
}

interface CostDto {
  object: 'page';
  data: CostBucket[];
  has_more: boolean;
  next_page?: string;
}

interface UserDto {
  object: 'organization.user';
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: number;
}

interface InviteUserDto {
  object: 'organization.invite';
  id: string;
  email: string;
  role: string;
  status: 'accepted' | 'expired' | 'pending';
  created_at: number;
  expires_at: number;
  accepted_at?: number;
  projects: {
    id: string;
    role: string;
  }[];
}

interface ProjectUserDto {
  object: 'organization.project.user';
  id: string;
  email: string;
  role: string;
  added_at: number;
}

interface DeleteUserDto {
  object: 'organization.user.deleted';
  id: string;
  deleted: boolean;
}

interface DeleteInviteDto {
  object: 'organization.invite.deleted';
  id: string;
  deleted: boolean;
}

interface DeleteApiKeyDto {
  object: 'organization.project.api_key.deleted';
  id: string;
  deleted: boolean;
}

class OpenAIClient extends BaseAPIClient {
  constructor(apiKey: string) {
    super('https://api.openai.com/v1/organization', {
      Authorization: `Bearer ${apiKey}`,
    });
  }
}

export class OpenAIProvider extends AIProvider {
  private client: OpenAIClient;

  constructor() {
    super();
    invariant(process.env.OPENAI_ADMIN_KEY, 'OPENAI_ADMIN_KEY is not set');
    this.client = new OpenAIClient(process.env.OPENAI_ADMIN_KEY);
  }

  getName(): string {
    return 'openai';
  }

  async getUserDetails(email: string): Promise<User | undefined> {
    // 1. Get the user details
    const userMemberFromProvider = await this.getUserFromProvider(email);
    if (!userMemberFromProvider) return undefined;

    const response: User = {
      name: userMemberFromProvider.userName,
      email,
      providers: [
        {
          name: this.getName(),
        },
      ],
    };

    // 2. Get the workspace
    const userWorkspace = await this.getUserWorkspace(userMemberFromProvider.userId, userMemberFromProvider.userName);

    if (userWorkspace) {
      // 5. Get the api keys
      const apiKeys = await this.getWorkspaceApiKeys(userWorkspace.workspaceId);
      const usedCredits = await this.getUsedCredits(userWorkspace.workspaceId);

      response.providers[0] = {
        ...response.providers[0],
        creditsUsed: usedCredits || 0,
        setLimitUrl: `https://platform.openai.com/settings/${userWorkspace.workspaceId}/limits`,
        apiKeys,
        workspaceUrl: userWorkspace.workspaceUrl,
      };
    }

    return response;
  }

  async getUsers(): Promise<User[]> {
    const users = await this.paginate<UserDto>('/users');
    const projects = await this.paginate<ProjectDto>('/projects');

    const userPromises = users.map(async user => {
      const userProject = projects.find(project => project.name.toLowerCase() === user.name.toLowerCase());
      if (userProject) {
        const isUserMember = await this.isUserAssignedToWorkspace(userProject.id, user.id);
        if (isUserMember) {
          return {
            email: user.email,
            name: user.name,
            providers: [
              { name: this.getName(), workspaceUrl: `https://platform.openai.com/settings/${userProject.id}` },
            ],
          };
        }
      }
      // Return a user object with undefined workspaceUrl if not a member
      return {
        email: user.email,
        name: user.name,
        providers: [{ name: this.getName(), workspaceUrl: undefined }],
      };
    });

    const resolvedUsers = await Promise.all(userPromises);
    return resolvedUsers.filter(user => user !== undefined) as User[]; // Filter out undefined values
  }

  async getUserFromProvider(
    email: string
  ): Promise<{ providerName: string; userName: string; userId: string } | undefined> {
    const organizationMembersResponse = await this.paginate<UserDto>('/users');
    const user = organizationMembersResponse.find(user => user.email === email.toLowerCase());
    if (!user) return undefined;
    return {
      providerName: this.getName(),
      userName: user.name,
      userId: user.id,
    };
  }

  async getUserPendingInvite(email: string): Promise<Invite | undefined> {
    const invitesResponse = await this.paginate<InviteUserDto>('/invites', 100);
    const invite = invitesResponse.find(invite => invite.email === email.toLowerCase() && invite.status === 'pending');
    if (!invite) return undefined;

    return {
      id: invite.id,
      email: invite.email,
      status: invite.status,
      provider: this.getName(),
      invitedAt: new Date(invite.created_at * 1000),
      expiresAt: new Date(invite.expires_at * 1000),
    };
  }

  async getInvites(): Promise<Invite[]> {
    const invitesResponse = await this.paginate<InviteUserDto>('/invites', 100);
    return invitesResponse.map(invite => ({
      id: invite.id,
      email: invite.email,
      status: invite.status,
      provider: this.getName(),
      invitedAt: new Date(invite.created_at * 1000),
      expiresAt: new Date(invite.expires_at * 1000),
    }));
  }

  async getUserWorkspace(
    userId: string,
    userName: string
  ): Promise<{ workspaceName: string; workspaceId: string; workspaceUrl: string } | undefined> {
    const projectsResponse = await this.paginate<ProjectDto>('/projects');
    const userProject = projectsResponse.find(project => project.name.toLowerCase() === userName.toLowerCase());
    if (!userProject) return undefined;

    const isUserMember = await this.isUserAssignedToWorkspace(userProject.id, userId);
    if (!isUserMember) return undefined;

    return {
      workspaceName: userProject.name,
      workspaceId: userProject.id,
      workspaceUrl: `https://platform.openai.com/settings/${userProject.id}`,
    };
  }

  async getWorkspaceApiKeys(workspaceId: string): Promise<{ name: string; keyHint: string; id: string }[]> {
    const apiKeysResponses = await this.client.get<ListDto<ProjectApiKeyDto>>(
      `/projects/${workspaceId}/api_keys?limit=100`
    );
    if (!apiKeysResponses.data) return [];
    return apiKeysResponses.data.map(key => ({
      name: key.name,
      keyHint: key.redacted_value.slice(0, 20) + key.redacted_value.slice(-4),
      id: key.id,
    }));
  }

  async inviteUser(email: string): Promise<boolean> {
    const inviteResponse = await this.client.post<InviteUserDto>('/invites', { email, role: 'reader' });
    return inviteResponse.id !== undefined;
  }

  async assignUserToWorkspace(userId: string, workspaceName: string): Promise<boolean> {
    const createProjectResponse = await this.client.post<ProjectDto>('/projects', {
      name: workspaceName,
    });

    if (createProjectResponse.id) {
      await this.client.post<ProjectUserDto>(`/projects/${createProjectResponse.id}/users`, {
        user_id: userId,
        role: 'member',
      });
      return true;
    }

    return false;
  }

  async removeUser(userId: string): Promise<boolean> {
    const deleteUserResponse = await this.client.delete<DeleteUserDto>(`/users/${userId}`);
    if (deleteUserResponse.id) {
      return true;
    }

    return false;
  }

  async removeWorkspace(workspaceId: string): Promise<boolean> {
    // Check if the workspace has api keys
    const apiKeys = await this.getWorkspaceApiKeys(workspaceId);
    if (apiKeys.length > 0) {
      // Delete the api keys
      await Promise.all(apiKeys.map(key => this.removeApiKey(key.id, workspaceId)));
    }

    // Proceed to remove the workspace
    const archiveWorkspaceResponse = await this.client.post<ProjectDto>(`/projects/${workspaceId}/archive`, {});
    return archiveWorkspaceResponse.status === 'archived';
  }

  async removeInvite(inviteId: string): Promise<boolean> {
    const { deleted } = await this.client.delete<DeleteInviteDto>(`/invites/${inviteId}`);
    return deleted;
  }

  private async paginate<T>(url: string, limit = 50): Promise<T[]> {
    let allItems: T[] = [];
    let lastId: string | undefined;
    let response: ListDto<T>; // Declare response outside the loop

    do {
      response = await this.client.get<ListDto<T>>(`${url}?limit=${limit}${lastId ? `&after=${lastId}` : ''}`);

      // Return early if the response is invalid
      if (!response || !response.data) return allItems;

      allItems.push(...response.data);
      lastId = response.last_id;

      // Log the pagination status
    } while (response.has_more && lastId);

    return allItems;
  }

  private async removeApiKey(apiKeyId: string, workspaceId: string): Promise<boolean> {
    const { deleted } = await this.client.delete<DeleteApiKeyDto>(`/projects/${workspaceId}/api_keys/${apiKeyId}`);
    return deleted;
  }

  private async getUsedCredits(userProjectId: string): Promise<number | undefined> {
    const params = new URLSearchParams({
      start_time: getStartOfCurrentMonth(), // Get start of the current month (1st day of the month at 00:00:00)
      end_time: getEndOfCurrentMonth(), // get end of today
      project_ids: userProjectId,
      limit: '31', // limit to 31 days (will return 31 buckets, cost per day max. days in month)
    });

    const costsResponse = await this.client.get<CostDto>(`/costs?${params}`);

    // Sum up all costs in the response
    let usedCredits = 0;
    costsResponse.data.forEach(bucket => {
      bucket.results.forEach(result => {
        if (result.amount) {
          usedCredits += result.amount.value;
        }
      });
    });

    return Math.round(usedCredits * 100) / 100; // Round to two decimal places
  }

  private async isUserAssignedToWorkspace(workspaceId: string, userId: string): Promise<boolean> {
    const usersInProjectResponse = await this.client.get<ListDto<ProjectUserDto>>(`/projects/${workspaceId}/users`);
    return usersInProjectResponse.data.some(user => user.id === userId);
  }
}
