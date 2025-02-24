import { Invite } from '@/domain/invite';
import { User } from '@/domain/user';
import { BaseAPIClient } from '@/utils/base-api-client';
import { getEndOfToday, getStartOfCurrentMonth } from '@/utils/dates-utils';
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
  project_id: string | null;
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
  next_page: string | null;
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
  status: string;
  invited_at: number;
  expires_at: number;
  accepted_at: number | null;
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

  async getUserInfo(email: string): Promise<User | undefined> {
    // 1. Look if the user is a member of the provider
    const memberFromProvider = await this.getMemberFromProvider(email);
    if (!memberFromProvider) return undefined;

    // 2. Get the projects
    const projectsResponse = await this.client.get<ListDto<ProjectDto>>('/projects?limit=100');

    // 3. Check if there is a project with the same name as the user name
    const userProject = projectsResponse.data.find(project => project.name === memberFromProvider.userName);
    if (!userProject) return undefined;

    // 4. Check if the user is a member of the project
    const usersInProjectResponse = await this.client.get<ListDto<ProjectUserDto>>(`/projects/${userProject.id}/users`);
    const isUserMember = usersInProjectResponse.data.some(user => user.id === memberFromProvider.userId);
    if (!isUserMember) return undefined;

    // 5. Get the api keys
    const apiKeysResponses = await this.client.get<ListDto<ProjectApiKeyDto>>(
      `/projects/${userProject.id}/api_keys?limit=100`
    );

    const apiKeys: ProjectApiKeyDto[] = apiKeysResponses.data;

    const usedCredits = await this.fetchUsedCredits(userProject.id);

    return {
      email,
      name: memberFromProvider.userName,
      providers: [
        {
          creditsUsed: usedCredits || 0,
          setLimitUrl: `https://platform.openai.com/settings/${userProject.id}/limits`,
          name: this.getName(),
          apiKeys: apiKeys.map(key => ({
            name: key.name,
            keyHint: key.redacted_value.slice(0, 20) + key.redacted_value.slice(-4),
          })),
        },
      ],
    };
  }

  async getUsers(): Promise<User[]> {
    const organizationMembersResponse = await this.client.get<ListDto<UserDto>>('/users?limit=100');

    return organizationMembersResponse.data.map(user => ({
      email: user.email,
      name: user.name,
      providers: [{ name: this.getName() }],
    }));
  }

  async addUser(email: string): Promise<boolean> {
    const userExists = await this.isUserMemberOfProvider(email);

    if (!userExists) {
      await this.client.post<InviteUserDto>('/invites', { email, role: 'reader' });
      return true; // User invited successfully
    }

    return false; // User already exists
  }

  async assignUser(userId: string, userName: string): Promise<boolean> {
    const createProjectResponse = await this.client.post<ProjectDto>('/projects', {
      name: userName,
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

  async removeUser(userId: string, userName: string): Promise<boolean> {
    // TODO: check if the user has a project
    const projectsResponse = await this.client.get<ListDto<ProjectDto>>('/projects?limit=100');
    const userProject = projectsResponse.data.find(project => project.name === userName);
    if (userProject) {
      // TODO: verify if the user is a member of the project
      const usersInProjectResponse = await this.client.get<ListDto<ProjectUserDto>>(
        `/projects/${userProject.id}/users`
      );
      const isUserMember = usersInProjectResponse.data.some(user => user.id === userId);
      if (isUserMember) {
        // TODO: remove the user from the project
        await this.client.post<ProjectDto>(`/projects/${userProject.id}/archive`, {});
      }
    }

    // TODO: remove the user from the provider
    const deleteUserResponse = await this.client.delete<DeleteUserDto>(`/users/${userId}`);
    if (deleteUserResponse.id) {
      return true;
    }

    return false;
  }

  async getMemberFromProvider(
    email: string
  ): Promise<{ providerName: string; userName: string; userId: string } | undefined> {
    const organizationMembersResponse = await this.client.get<ListDto<UserDto>>('/users?limit=100');
    const user = organizationMembersResponse.data.find(user => user.email === email);
    if (!user) return undefined;
    return {
      providerName: this.getName(),
      userName: user.name,
      userId: user.id,
    };
  }

  async isUserInvitePending(email: string): Promise<boolean> {
    const invitesResponse = await this.client.get<ListDto<InviteUserDto>>('/invites?limit=100');
    return invitesResponse.data.some(invite => invite.email === email && invite.status === 'pending');
  }

  async isUserMemberOfProvider(email: string): Promise<boolean> {
    const organizationMembersResponse = await this.client.get<ListDto<UserDto>>('/users?limit=100');
    return organizationMembersResponse.data.some(user => user.email === email);
  }

  async isUserAssignedToProvider(userId: string, userName: string): Promise<boolean> {
    const projectsResponse = await this.client.get<ListDto<ProjectDto>>('/projects?limit=100');
    const userProject = projectsResponse.data.find(project => project.name === userName);
    if (!userProject) return false;
    const usersInProjectResponse = await this.client.get<ListDto<ProjectUserDto>>(`/projects/${userProject.id}/users`);
    return usersInProjectResponse.data.some(user => user.id === userId);
  }

  private async fetchUsedCredits(userProjectId: string): Promise<number | undefined> {
    const params = new URLSearchParams({
      start_time: getStartOfCurrentMonth(), // Get start of the current month (1st day of the month at 00:00:00)
      end_time: getEndOfToday(), // get end of today
      project_ids: userProjectId,
      limit: '31', // limit to 31 days (will return 31 buckets, cost per day)
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

    return Math.round(usedCredits * 1000) / 1000; // Round to three decimal places
  }

  async getPendingInvites(): Promise<Invite[]> {
    const invitesResponse = await this.client.get<ListDto<InviteUserDto>>('/invites?limit=100');
    const pendingInvites = invitesResponse.data.filter(invite => invite.status === 'pending');
    return pendingInvites.map(invite => ({
      email: invite.email,
      status: 'pending',
      provider: this.getName(),
    }));
  }
}
