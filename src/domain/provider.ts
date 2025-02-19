import { ApiKey } from './api-key';

export interface Provider {
  name: string;
  creditsLimit: number;
  creditsUsed: number;
  apiKeys: ApiKey[];
}
