import { mergeUsers, User } from '@/domain/user';
import { createProvider } from '@/providers/ai-provider-factory';
import * as store from '@/store';
import { describe, expect, it, Mock, vi } from 'vitest';
import { userCommandListAction } from './command-list';

vi.mock('@/store');
vi.mock('@/providers/ai-provider-factory');

describe('userCommandListAction', () => {
  let mockUsers: User[] = [];

  beforeEach(() => {
    mockUsers = [
      { email: 'user1@example.com', name: 'User One', providers: [{ name: 'openai' }, { name: 'anthropic' }] },
      { email: 'user2@example.com', name: 'User Two', providers: [{ name: 'openai' }] },
    ];
  });

  it('should fetch users from providers when store is empty', async () => {
    // arrange
    (store.get as Mock).mockReturnValueOnce({ users: [] });
    // const storeGetMock = vi.spyOn(store, 'get').mockReturnValue({ users: [] });
    const mockProvider = {
      fetchUsers: vi.fn().mockResolvedValue(mockUsers),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userCommandListAction({ sync: true });

    // assert
    expect(store.get).toHaveBeenCalledWith('users');
    expect(mockProvider.fetchUsers).toHaveBeenCalled();
    expect(store.set).toHaveBeenCalledWith('users', mockUsers);
  });

  it('should not fetch users from providers when store is not empty', async () => {
    // arrange
    (store.get as Mock).mockReturnValueOnce({ users: mockUsers });

    const mockProvider = {
      fetchUsers: vi.fn(),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userCommandListAction({ sync: false });

    // assert
    expect(store.get).toHaveBeenCalledWith('users');
    expect(mockProvider.fetchUsers).not.toHaveBeenCalled(); // Should not call fetchUsers
  });

  it('should apply filter that returns no results', async () => {
    // arrange
    (store.get as Mock).mockReturnValueOnce({ users: mockUsers });

    // act
    await userCommandListAction({ filter: 'nonexistent' });

    // assert
    expect(store.get).toHaveBeenCalledWith('users');
  });

  it('should handle case where provider fetches no users', async () => {
    // arrange
    (store.get as Mock).mockReturnValueOnce({ users: [] });

    const mockProvider = {
      fetchUsers: vi.fn().mockResolvedValue([]), // No users returned
    };
    (createProvider as Mock).mockReturnValue(mockProvider);
    (mergeUsers as Mock).mockReturnValue([]);

    // act
    await userCommandListAction({ sync: true });

    // assert
    expect(store.get).toHaveBeenCalledWith('users');
    expect(mockProvider.fetchUsers).toHaveBeenCalled();
    expect(mergeUsers).toHaveBeenCalled();
    expect(store.set).toHaveBeenCalledWith('users', []);
  });
});
