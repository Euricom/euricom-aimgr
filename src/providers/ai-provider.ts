export interface ApiKey {
  value: string;
  name: string;
  creditsUsed: number;
}

export interface Provider {
  name: string;
  creditsLimit: number;
  creditsUsed: number;
  apiKeys: ApiKey[];
}

export interface User {
  email: string;
  name: string;
  providers: Provider[];
}

// Base provider can implement the interfaces it supports
export abstract class AIProvider {
  abstract getName(): string;
  abstract fetchUserInfo(email: string): Promise<Provider>;
  abstract fetchUsers(): Promise<User[]>;
}
