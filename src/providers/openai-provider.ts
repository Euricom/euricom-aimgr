import { User } from '@/domain/user';
import { BaseAPIClient } from '@/utils/base-api-client';
import { getEndOfToday, getStartOfCurrentMonth } from '@/utils/dates-utils';
import { normalizeEmail, normalizeString } from '@/utils/string-utils';
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

  async fetchUserInfo(email: string): Promise<User> {
    // Get all the projects
    const projectsResponse = await this.client.get<ListDto<ProjectDto>>('/projects?limit=100');

    const emailParts = normalizeEmail(email);
    const userProject = projectsResponse.data.find(project => {
      const projectName = normalizeString(project.name);
      return emailParts.every(part => projectName.includes(part));
    });

    if (!userProject) {
      return {
        email: email,
        name: '',
        providers: [],
      };
    }

    const apiKeysResponses = await this.client.get<ListDto<ProjectApiKeyDto>>(
      `/projects/${userProject.id}/api_keys?limit=100`
    );

    const apiKeys: ProjectApiKeyDto[] = apiKeysResponses.data;

    const usedCredits = await this.fetchUsedCredits(userProject.id);

    return {
      email,
      name: userProject.name.toLowerCase(),
      providers: [
        {
          creditsUsed: usedCredits,
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

  async fetchUsers(): Promise<User[]> {
    // 1. Get all projects
    const projectsResponse = await this.client.get<ListDto<ProjectDto>>('/projects?limit=100');

    // 2. Get all projects and use the project name to generate the user email & name
    const users: { name: string; email: string }[] = projectsResponse.data.map(project => ({
      name: project.name.toLowerCase(),
      email: `${project.name.split(' ')[0].toLowerCase()}.${project.name.split(' ').slice(1).join('').toLowerCase()}@euri.com`,
    }));

    return users.map(user => ({
      email: user.email,
      name: user.name,
      providers: [{ name: this.getName() }],
    }));
  }

  private async fetchUsedCredits(userProjectId: string): Promise<number> {
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
}
