import { User } from '@/domain/user';
import { createProvider } from '@/providers/ai-provider-factory';
import * as store from '@/store';
import { describe, expect, it, Mock, vi } from 'vitest';
import { userInfoCommand } from './command-info';

vi.mock('@/store');
vi.mock('@/providers/ai-provider-factory');

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
      isUserInvitePending: vi.fn().mockResolvedValue(false),
      fetchUserInfo: vi.fn().mockResolvedValue(mockUser),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userInfoCommand('user@example.com');

    // assert
    expect(store.get).toHaveBeenCalledWith('users');
    expect(store.set).toHaveBeenCalledWith('users', [mockUser]);
  });

  it('should handle errors gracefully', async () => {
    // arrange
    const mockProvider = {
      isUserInvitePending: vi.fn().mockRejectedValue(new Error('Error fetching invite status')),
      fetchUserInfo: vi.fn(),
      getName: vi.fn(),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userInfoCommand('user@example.com');

    // assert
    expect(store.get).toHaveBeenCalledWith('users');
  });
});
