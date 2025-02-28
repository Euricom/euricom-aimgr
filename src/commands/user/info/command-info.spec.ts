import { User } from '@/domain/user';
import { createProvider } from '@/providers/ai-provider-factory';
import * as store from '@/store';
import * as loading from '@/utils/loading';
import consola from 'consola';
import { describe, expect, it, Mock, vi } from 'vitest';
import { userInfoCommand } from './command-info';

vi.mock('@/store');
vi.mock('@/providers/ai-provider-factory');
vi.mock('consola');
vi.mock('@/utils/loading');

describe('userInfoCommand', () => {
  const mockUser: User = {
    email: 'user@example.com',
    name: 'User Example',
    providers: [{ name: 'openai', creditsUsed: 10, apiKeys: [] }],
  };

  beforeEach(() => {
    (store.get as Mock).mockReturnValueOnce([]);
  });

  it('should fetch user info and update store', async () => {
    // arrange
    const mockProvider = {
      getUserPendingInvite: vi.fn().mockResolvedValue(undefined),
      getUserDetails: vi.fn().mockResolvedValue(mockUser),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userInfoCommand('user@example.com');

    // assert
    expect(store.get).toHaveBeenCalledWith('users');
    expect(store.set).toHaveBeenCalledWith('users', [mockUser]);
  });

  it('should handle pending invites', async () => {
    // arrange
    const mockProvider = {
      getUserPendingInvite: vi.fn().mockResolvedValue({
        email: 'user@example.com',
        provider: 'anthropic',
        invitedAt: new Date(),
        expiresAt: new Date(),
        id: '1',
      }),
      getUserDetails: vi.fn().mockResolvedValue(mockUser),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userInfoCommand('user@example.com');

    // assert
    expect(loading.warn).toHaveBeenCalledWith(expect.stringContaining('has an invite'));
  });

  it('should handle user not found', async () => {
    // arrange
    const mockProvider = {
      getUserPendingInvite: vi.fn().mockResolvedValue(undefined),
      getUserDetails: vi.fn().mockResolvedValue(undefined),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userInfoCommand('user@example.com');

    // assert
    expect(loading.fail).toHaveBeenCalledWith(expect.stringContaining('not found in any provider'));
  });

  it('should handle user with no API keys', async () => {
    // arrange
    const mockUserNoKeys: User = {
      email: 'user@example.com',
      name: 'User Example',
      providers: [{ name: 'openai', creditsUsed: 0, apiKeys: [] }],
    };
    const mockProvider = {
      getUserPendingInvite: vi.fn().mockResolvedValue(undefined),
      getUserDetails: vi.fn().mockResolvedValue(mockUserNoKeys),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userInfoCommand('user@example.com');

    // assert
    expect(store.get).toHaveBeenCalledWith('users');
    expect(store.set).toHaveBeenCalledWith('users', [mockUserNoKeys]);
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('API Keys:'));
  });

  it('should handle errors gracefully', async () => {
    // arrange
    const mockProvider = 'fake provider';
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userInfoCommand('user@example.com');

    // assert
    expect(consola.error).toHaveBeenCalled();
  });
});
