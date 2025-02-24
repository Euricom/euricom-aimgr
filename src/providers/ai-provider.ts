import { User } from '@/domain/user';

// Base provider can implement the interfaces it supports
export abstract class AIProvider {
  abstract getName(): string;
  abstract getUserInfo(email: string): Promise<User | undefined>;
  abstract getUsers(): Promise<User[]>;
  abstract addUser(email: string): Promise<boolean>;
  abstract assignUser(userId: string, userName: string): Promise<boolean>;
  abstract getMemberFromProvider(
    email: string
  ): Promise<{ providerName: string; userName: string; userId: string } | undefined>;
  abstract isUserInvitePending(email: string): Promise<boolean>;
  abstract isUserMemberOfProvider(email: string): Promise<boolean>;
  abstract isUserAssignedToProvider(userId: string, userName: string): Promise<boolean>;
}
