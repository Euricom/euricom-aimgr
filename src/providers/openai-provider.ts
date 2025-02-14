import { ofetch } from 'ofetch';
import { AIProvider, Provider, User } from './ai-provider';

interface ProjectDto {
  id: string;
  object: 'organization.project';
  name: string;
  created_at: number;
  archived_at?: number;
  status: 'active' | 'archived';
}

interface ProjectUserDto {
  object: 'organization.project.user';
  id: string;
  name: string;
  email: string;
  role: string;
  added_at: number;
}

interface ListDto<T> {
  object: 'list';
  data: T[];
  first_id: string;
  last_id: string;
  has_more: boolean;
}

class OpenAIClient {
  private baseURL = 'https://api.openai.com/v1/organization';

  constructor(private apiKey: string) {}

  get<T>(url: string) {
    return ofetch<T>(url, {
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }
}

export class OpenAIProvider extends AIProvider {
  private client: OpenAIClient;

  constructor() {
    super();
    if (!process.env.OPENAI_ADMIN_KEY) {
      throw new Error('OPENAI_ADMIN_KEY is not set');
    }
    this.client = new OpenAIClient(process.env.OPENAI_ADMIN_KEY);
  }

  getName(): string {
    return 'openai';
  }

  async fetchUserInfo(email: string): Promise<Provider> {
    return {
      name: this.getName(),
      creditsLimit: 0,
      creditsUsed: 0,
      apiKeys: [],
    };
  }

  async fetchUsers(): Promise<User[]> {
    // 1. Get all projects
    const projectsResponse = await this.client.get<ListDto<ProjectDto>>('/projects');

    // 2. Get users for each project in parallel
    const users: { name: string; email: string; projects: string[] }[] = [];

    await Promise.all(
      projectsResponse.data.map(async project => {
        const projectUsersResponse = await this.client.get<ListDto<ProjectUserDto>>(`/projects/${project.id}/users`);

        projectUsersResponse.data.forEach(user => {
          const existingUser = users.find(u => u.email === user.email);
          if (existingUser) {
            existingUser.projects.push(project.name);
          } else {
            users.push({
              name: user.name,
              email: user.email,
              projects: [project.name],
            });
          }
        });
      })
    );

    // 3. Convert to User format
    return users.map(user => ({
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
