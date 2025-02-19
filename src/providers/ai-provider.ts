import { Provider } from '@/domain/provider';
import { User } from '@/domain/user';

// Base provider can implement the interfaces it supports
export abstract class AIProvider {
  abstract getName(): string;
  abstract fetchUserInfo(email: string): Promise<Provider>;
  abstract fetchUsers(): Promise<User[]>;
}
