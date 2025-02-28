import { Invite } from '@/domain/invite';
import { User } from '@/domain/user';
import { AIProvider } from '@/providers/ai-provider';
import { createProvider } from '@/providers/ai-provider-factory';
import * as store from '@/store';
import * as loading from '@/utils/loading';
import consola from 'consola';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { userInfoCommand } from './command-info';

// Define a comprehensive mock for the AI provider
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

// Mock the entire module and provide a custom implementation for createProvider
vi.mock('@/providers/ai-provider-factory', () => ({
  createProvider: vi.fn(() => mockAIProvider),
}));

vi.mock('@/store');

describe('userInfoCommand', () => {
  let mockUser: User = {
    email: 'user@example.com',
    name: 'User Example',
    providers: [{ name: 'openai', creditsUsed: 10, apiKeys: [{ keyHint: '123', name: 'test' }] }],
  };

  beforeEach(() => {
    (store.get as Mock).mockReturnValueOnce([]);
  });

  it('should fetch user info and update store', async () => {
    // arrange
    vi.spyOn(mockAIProvider, 'getUserDetails').mockResolvedValue(mockUser);

    // act
    await userInfoCommand('user@example.com');

    // assert
    expect(store.get).toHaveBeenCalledWith('users');
    expect(store.set).toHaveBeenCalledWith('users', [mockUser]);
  });

  it('should handle pending invites', async () => {
    // arrange
    const pendingInvite: Invite = {
      email: 'user@example.com',
      provider: 'anthropic',
      invitedAt: new Date(),
      expiresAt: new Date(),
      id: '1',
      status: 'pending',
    };
    vi.spyOn(mockAIProvider, 'getUserPendingInvite').mockResolvedValue(pendingInvite);
    vi.spyOn(mockAIProvider, 'getUserDetails').mockResolvedValue(mockUser);

    // act
    await userInfoCommand('user@example.com');

    // assert
    expect(loading.warn).toHaveBeenCalledWith(expect.stringContaining('has an invite'));
  });

  it('should handle user not found', async () => {
    // arrange
    vi.spyOn(mockAIProvider, 'getUserPendingInvite').mockResolvedValue(undefined);
    vi.spyOn(mockAIProvider, 'getUserDetails').mockResolvedValue(undefined);

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
    vi.spyOn(mockAIProvider, 'getUserPendingInvite').mockResolvedValue(undefined);
    vi.spyOn(mockAIProvider, 'getUserDetails').mockResolvedValue(mockUserNoKeys);

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
