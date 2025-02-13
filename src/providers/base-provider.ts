export interface ApiKeyData {
  value: string;
  name: string;
  creditsUsed: number;
}

export interface ProviderData {
  name: string;
  creditsLimit: number;
  creditsUsed: number;
  apiKeys: ApiKeyData[];
}

export interface UserData {
  email: string;
  name: string;
  providers: ProviderData[];
}

// Split the BaseProvider into more focused interfaces
export interface IUserProvider {
  fetchUsers(): Promise<UserData[]>;
}

export interface IUserInfoProvider {
  fetchUserInfo(email: string): Promise<ProviderData>;
}

export interface IKeyManagementProvider {
  addApiKey(email: string): Promise<ApiKeyData>;
  removeApiKey(email: string, keyName: string): Promise<void>;
}

// Base provider can implement the interfaces it supports
export abstract class BaseProvider implements IUserProvider, IUserInfoProvider {
  constructor(protected apiKey: string) {}

  abstract getName(): string;
  abstract fetchUserInfo(email: string): Promise<ProviderData>;
  abstract fetchUsers(): Promise<UserData[]>;
}
