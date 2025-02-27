import { createProvider } from '@/providers/ai-provider-factory';
import * as loading from '@/utils/loading';
import consola from 'consola';
import { describe, expect, it, Mock, vi } from 'vitest';
import { userInviteCommand } from './command-invite';

vi.mock('@/providers/ai-provider-factory');
vi.mock('@/utils/loading');
vi.mock('consola');

describe('userInviteCommand', () => {
  const email = 'user@example.com';
  const options = { provider: 'openai' };

  it('should add user to provider', async () => {
    // arrange
    const mockProvider = {
      getUserFromProvider: vi.fn().mockResolvedValue(undefined),
      getUserPendingInvite: vi.fn().mockResolvedValue(undefined),
      inviteUser: vi.fn().mockResolvedValue(true),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userInviteCommand(email, options);

    // assert
    expect(mockProvider.inviteUser).toHaveBeenCalledWith(email.toLowerCase());
    expect(loading.succeed).toHaveBeenCalledWith(`Invited ${email} to ${options.provider} and waiting for acceptance.`);
  });

  it('should handle user already exists', async () => {
    // arrange
    const mockProvider = {
      getUserFromProvider: vi.fn().mockResolvedValue({
        userId: '123',
        userName: 'user',
      }),
      inviteUser: vi.fn(),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userInviteCommand(email, options);

    // assert
    expect(loading.warn).toHaveBeenCalledWith(`${email} is already a member of openai.`);
  });

  it('should handle user with a pending invite', async () => {
    // arrange
    const invitedAtDate = new Date();
    const mockProvider = {
      getUserFromProvider: vi.fn().mockResolvedValue(undefined),
      getUserPendingInvite: vi.fn().mockResolvedValue({
        invitedAt: invitedAtDate,
      }),
      inviteUser: vi.fn(),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userInviteCommand(email, options);

    // assert
    expect(loading.warn).toHaveBeenCalledWith(
      `${email} is already invited to openai and waiting for acceptance since ${invitedAtDate.toLocaleString()}`
    );
  });

  it('should handle errors gracefully', async () => {
    // arrange
    const mockProvider = {
      getUserFromProvider: vi.fn().mockResolvedValue(undefined),
      getUserPendingInvite: vi.fn().mockResolvedValue(undefined),
      inviteUser: vi.fn().mockRejectedValue(new Error('Invite user failed')),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userInviteCommand(email, options);

    // assert
    expect(consola.error).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should handle provider not found', async () => {
    // arrange
    const mockProvider = 'fake provider';
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userInviteCommand(email, options);

    // assert
    expect(consola.error).toHaveBeenCalled();
  });
});
