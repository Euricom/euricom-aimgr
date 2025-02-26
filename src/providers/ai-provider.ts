import { Invite } from '@/domain/invite';
import { User } from '@/domain/user';

// Base provider can implement the interfaces it supports
export abstract class AIProvider {
  abstract getName(): string;
  abstract getUserDetails(email: string): Promise<User | undefined>;
  abstract getUsers(): Promise<User[]>;
  abstract getUserFromProvider(
    email: string
  ): Promise<{ providerName: string; userName: string; userId: string } | undefined>;
  abstract getUserPendingInvite(email: string): Promise<Invite | undefined>;
  abstract getInvites(): Promise<Invite[]>;
  abstract getUserWorkspace(
    userId: string,
    userName: string
  ): Promise<{ workspaceName: string; workspaceId: string; workspaceUrl: string } | undefined>;
  abstract getWorkspaceApiKeys(workspaceId: string): Promise<{ name: string; keyHint: string }[]>;
  abstract addUser(email: string): Promise<boolean>;
  abstract assignUserToWorkspace(userId: string, workspaceName: string): Promise<boolean>;
  abstract removeUser(userId: string): Promise<boolean>;
  abstract removeWorkspace(workspaceId: string): Promise<boolean>;
}
