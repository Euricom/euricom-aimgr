import { ApiKey } from './api-key';

export interface Provider {
  name: string;
  creditsUsed?: number;
  apiKeys?: ApiKey[];
  setLimitUrl?: string;
  workspaceUrl?: string;
}
