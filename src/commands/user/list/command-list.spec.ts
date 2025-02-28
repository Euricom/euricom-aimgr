// existing imports...
import { User } from '@/domain/user';
import { AIProvider } from '@/providers/ai-provider';
import * as store from '@/store';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { userListCommand } from './command-list';

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

describe('userListCommand', () => {
  let mockUsers: User[] = [];

  beforeEach(() => {
    mockUsers = [
      { email: 'user1@example.com', name: 'User One', providers: [{ name: 'openai' }, { name: 'anthropic' }] },
      { email: 'user2@example.com', name: 'User Two', providers: [{ name: 'openai' }] },
    ];
  });

  it('should fetch users from providers when store is empty', async () => {
    // arrange
    (store.get as Mock).mockReturnValueOnce([]);
    vi.spyOn(mockAIProvider, 'getUsers').mockResolvedValue(mockUsers);

    // act
    await userListCommand({ sync: true });

    // assert
    expect(store.get).toHaveBeenCalledWith('users');
    expect(mockAIProvider.getUsers).toHaveBeenCalled();
    expect(store.set).toHaveBeenCalledWith('users', mockUsers);
  });

  it('should not fetch users from providers when store is not empty', async () => {
    // arrange
    (store.get as Mock).mockReturnValueOnce(mockUsers);
    vi.spyOn(mockAIProvider, 'getUsers').mockResolvedValue(mockUsers);

    // act
    await userListCommand({ sync: false });

    // assert
    expect(store.get).toHaveBeenCalledWith('users');
    expect(mockAIProvider.getUsers).not.toHaveBeenCalled(); // Should not call getUsers
  });

  it('should apply filter that returns results', async () => {
    // arrange
    (store.get as Mock).mockReturnValueOnce(mockUsers);

    // act
    await userListCommand({ filter: 'user1' });

    // assert
    expect(store.get).toHaveBeenCalledWith('users');
    expect(mockUsers.filter(user => user.email.includes('user1')).length).toBe(1);
  });

  it('should apply filter that returns no results', async () => {
    // arrange
    (store.get as Mock).mockReturnValueOnce(mockUsers);

    // act
    await userListCommand({ filter: 'nonexistent' });

    // assert
    expect(store.get).toHaveBeenCalledWith('users');
    expect(mockUsers.filter(user => user.email.includes('nonexistent')).length).toBe(0);
  });

  it('should handle case where provider fetches no users', async () => {
    // arrange
    (store.get as Mock).mockReturnValueOnce([]);

    vi.spyOn(mockAIProvider, 'getUsers').mockResolvedValue([]);

    // act
    await userListCommand({ sync: true });

    // assert
    expect(store.get).toHaveBeenCalledWith('users');
    expect(mockAIProvider.getUsers).toHaveBeenCalled();
    expect(store.set).toHaveBeenCalledWith('users', []);
  });

  it('should handle empty user list gracefully', async () => {
    // arrange
    (store.get as Mock).mockReturnValueOnce([]);

    vi.spyOn(mockAIProvider, 'getUsers').mockResolvedValue([]);

    // act
    await userListCommand({ sync: true });

    // assert
    expect(store.get).toHaveBeenCalledWith('users');
    expect(mockAIProvider.getUsers).toHaveBeenCalled();
    expect(store.set).toHaveBeenCalledWith('users', []);
  });
});
