import { User } from '@/domain/user';

// Base provider can implement the interfaces it supports
export abstract class AIProvider {
  abstract getName(): string;
  abstract fetchUserInfo(email: string): Promise<User>;
  abstract fetchUsers(): Promise<User[]>;
  abstract addUser(email: string): Promise<boolean>;
  abstract assignUser(email: string): Promise<boolean>;
  abstract isUserMemberOfProvider(email: string): Promise<boolean>;
  abstract isUserInvitePending(email: string): Promise<boolean>;
}
