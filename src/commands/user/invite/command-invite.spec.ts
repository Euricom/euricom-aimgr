import { AIProvider } from '@/providers/ai-provider';
import * as loading from '@/utils/loading';
import consola from 'consola';
import { describe, expect, it, vi } from 'vitest';
import { userInviteCommand } from './command-invite';

let mockAIProvider: AIProvider = {
  getName: vi.fn().mockReturnValue('mockProvider'),
  getUserDetails: vi.fn().mockResolvedValue(undefined),
  getUsers: vi.fn().mockResolvedValue([]),
  getUserFromProvider: vi.fn().mockResolvedValue(undefined),
  getUserPendingInvite: vi.fn().mockResolvedValue(undefined),
  getInvites: vi.fn().mockResolvedValue([]),
  getUserWorkspace: vi.fn().mockResolvedValue(undefined),
  getWorkspaceApiKeys: vi.fn().mockResolvedValue([]),
  inviteUser: vi.fn().mockResolvedValue(false),
  assignUserToWorkspace: vi.fn().mockResolvedValue(false),
  removeUser: vi.fn().mockResolvedValue(false),
  removeWorkspace: vi.fn().mockResolvedValue(false),
  removeInvite: vi.fn().mockResolvedValue(false),
};

vi.mock('@/providers/ai-provider-factory', () => ({
  createProvider: vi.fn(() => mockAIProvider),
}));

describe('userInviteCommand', () => {
  const email = 'user@example.com';
  const options = { provider: 'mockProvider' };

  it('should add user to provider', async () => {
    // arrange
    vi.spyOn(mockAIProvider, 'inviteUser').mockResolvedValue(true);

    // act
    await userInviteCommand(email, options);

    // assert
    expect(mockAIProvider.inviteUser).toHaveBeenCalledWith(email.toLowerCase());
    expect(loading.succeed).toHaveBeenCalledWith(`Invited ${email} to mockProvider and waiting for acceptance.`);
  });

  it('should handle user already exists', async () => {
    // arrange
    vi.spyOn(mockAIProvider, 'getUserFromProvider').mockResolvedValue({
      userId: '123',
      userName: 'user',
      providerName: 'mockProvider',
    });

    // act
    await userInviteCommand(email, options);

    // assert
    expect(loading.warn).toHaveBeenCalledWith(`${email} is already a member of mockProvider.`);
  });

  it('should handle user with a pending invite', async () => {
    // arrange
    vi.spyOn(mockAIProvider, 'getUserFromProvider').mockResolvedValue(undefined);
    vi.spyOn(mockAIProvider, 'getUserPendingInvite').mockResolvedValue({
      id: '1',
      email: email,
      status: 'pending',
      provider: 'mockProvider',
      expiresAt: new Date(),
      invitedAt: new Date(),
    });

    // act
    await userInviteCommand(email, options);

    // assert
    expect(loading.warn).toHaveBeenCalledWith(
      `${email} is already invited to mockProvider and waiting for acceptance since ${new Date().toLocaleString()}`
    );
  });

  it('should handle errors gracefully', async () => {
    // arrange
    vi.spyOn(mockAIProvider, 'getUserFromProvider').mockResolvedValue(undefined);
    vi.spyOn(mockAIProvider, 'getUserPendingInvite').mockResolvedValue(undefined);
    vi.spyOn(mockAIProvider, 'inviteUser').mockRejectedValue(new Error('Invite user failed'));

    // act
    await userInviteCommand(email, options);

    // assert
    expect(consola.error).toHaveBeenCalled();
  });

  it('should handle provider not found', async () => {
    // arrange
    vi.spyOn(mockAIProvider, 'inviteUser').mockRejectedValue(new Error('Invite user failed'));

    // act
    await userInviteCommand(email, options);

    // assert
    expect(consola.error).toHaveBeenCalled();
  });
});
