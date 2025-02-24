// existing imports...
import { User } from '@/domain/user';
import { createProvider } from '@/providers/ai-provider-factory';
import * as store from '@/store';
import { consola } from 'consola';
import { describe, expect, it, Mock, vi } from 'vitest';
import { userListCommand } from './command-list';

vi.mock('@/store');
vi.mock('@/providers/ai-provider-factory');
vi.mock('@/utils/display-table');
vi.mock('@/utils/loading');
vi.mock('consola');

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
    const mockProvider = {
      getUsers: vi.fn().mockResolvedValue(mockUsers),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userListCommand({ sync: true });

    // assert
    expect(store.get).toHaveBeenCalledWith('users');
    expect(mockProvider.getUsers).toHaveBeenCalled();
    expect(store.set).toHaveBeenCalledWith('users', mockUsers);
  });

  it('should not fetch users from providers when store is not empty', async () => {
    // arrange
    (store.get as Mock).mockReturnValueOnce(mockUsers);

    const mockProvider = {
      getUsers: vi.fn(),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userListCommand({ sync: false });

    // assert
    expect(store.get).toHaveBeenCalledWith('users');
    expect(mockProvider.getUsers).not.toHaveBeenCalled(); // Should not call getUsers
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

    const mockProvider = {
      getUsers: vi.fn().mockResolvedValue([]), // No users returned
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userListCommand({ sync: true });

    // assert
    expect(store.get).toHaveBeenCalledWith('users');
    expect(mockProvider.getUsers).toHaveBeenCalled();
    expect(store.set).toHaveBeenCalledWith('users', []);
  });

  it('should handle empty user list gracefully', async () => {
    // arrange
    (store.get as Mock).mockReturnValueOnce([]);

    const mockProvider = {
      getUsers: vi.fn().mockResolvedValue([]), // No users returned
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userListCommand({ sync: true });

    // assert
    expect(store.get).toHaveBeenCalledWith('users');
    expect(mockProvider.getUsers).toHaveBeenCalled();
    expect(store.set).toHaveBeenCalledWith('users', []);
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('User List:'));
  });
});
