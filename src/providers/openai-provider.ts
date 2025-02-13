import consola from 'consola';
import { ofetch } from 'ofetch';
import { BaseProvider, ProviderData, UserData } from './base-provider';

interface OpenAIProject {
  id: string;
  object: 'organization.project';
  name: string;
  created_at: number;
  archived_at: number | null;
  status: 'active' | 'archived';
}

interface OpenAIProjectUser {
  object: 'organization.project.user';
  id: string;
  name: string;
  email: string;
  role: string;
  added_at: number;
}

interface OpenAIListResponse<T> {
  object: 'list';
  data: T[];
  first_id: string;
  last_id: string;
  has_more: boolean;
}

export class OpenAIProvider extends BaseProvider {
  private readonly baseUrl = 'https://api.openai.com/v1';
  private readonly headers: Record<string, string>;

  constructor(apiKey: string) {
    super(apiKey);
    this.headers = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  getName(): string {
    return 'openai';
  }

  async fetchUserInfo(email: string): Promise<ProviderData> {
    return {
      name: this.getName(),
      creditsLimit: 0,
      creditsUsed: 0,
      apiKeys: [],
    };
  }

  async fetchUsers(): Promise<UserData[]> {
    try {
      // 1. Get all projects
      const projectsResponse = await ofetch<OpenAIListResponse<OpenAIProject>>(
        '/organization/projects',
        {
          baseURL: this.baseUrl,
          headers: this.headers,
        }
      );
      const projects = projectsResponse.data;

      // 2. Get users for each project
      const userMap = new Map<string, { name: string; email: string; projects: string[] }>();

      for (const project of projects) {
        const projectUsersResponse = await ofetch<OpenAIListResponse<OpenAIProjectUser>>(
          `/organization/projects/${project.id}/users`,
          {
            baseURL: this.baseUrl,
            headers: this.headers,
          }
        );

        projectUsersResponse.data.forEach(user => {
          if (!userMap.has(user.email)) {
            userMap.set(user.email, {
              name: user.name,
              email: user.email,
              projects: [project.name],
            });
          } else {
            userMap.get(user.email)?.projects.push(project.name);
          }
        });
      }

      // 3. Convert to UserData format
      return [...userMap.values()].map(user => ({
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
      consola.error('Error fetching OpenAI users:', error);
      throw error;
    }
  }
}
