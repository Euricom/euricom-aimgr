import { mergeUsers } from '@/domain/user';
import { createProvider } from '@/providers/ai-provider-factory';
import * as store from '@/store';
import { describe, expect, it, Mock, vi } from 'vitest';
import { listAction } from './command-list';

vi.mock('@/store');
vi.mock('@/providers/ai-provider-factory');
vi.mock('@/domain/user');

describe('listAction', () => {
  const mockUsers = [
    { email: 'user1@example.com', name: 'User One', providers: [{ name: 'openai' }, { name: 'anthropic' }] },
    { email: 'user2@example.com', name: 'User Two', providers: [{ name: 'openai' }] },
  ];

  it('should fetch users from providers when store is empty', async () => {
    (store.get as Mock).mockReturnValueOnce({ users: [] });

    const mockProvider = {
      fetchUsers: vi.fn().mockResolvedValue(mockUsers),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);
    (mergeUsers as Mock).mockReturnValue(mockUsers);

    await listAction({ sync: true });

    expect(store.get).toHaveBeenCalledWith('users');
    expect(mockProvider.fetchUsers).toHaveBeenCalled();
    expect(mergeUsers).toHaveBeenCalled();
    expect(store.set).toHaveBeenCalledWith('users', mockUsers);
  });

  it('should not fetch users from providers when store is not empty', async () => {
    (store.get as Mock).mockReturnValueOnce({ users: mockUsers });

    const mockProvider = {
      fetchUsers: vi.fn(),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    await listAction({ sync: false });

    expect(store.get).toHaveBeenCalledWith('users');
    expect(mockProvider.fetchUsers).not.toHaveBeenCalled(); // Should not call fetchUsers
  });

  it('should apply filter that returns no results', async () => {
    (store.get as Mock).mockReturnValueOnce({ users: mockUsers });

    await listAction({ filter: 'nonexistent' });

    expect(store.get).toHaveBeenCalledWith('users');
  });

  it('should handle case where provider fetches no users', async () => {
    (store.get as Mock).mockReturnValueOnce({ users: [] });

    const mockProvider = {
      fetchUsers: vi.fn().mockResolvedValue([]), // No users returned
    };
    (createProvider as Mock).mockReturnValue(mockProvider);
    (mergeUsers as Mock).mockReturnValue([]);

    await listAction({ sync: true });

    expect(store.get).toHaveBeenCalledWith('users');
    expect(mockProvider.fetchUsers).toHaveBeenCalled();
    expect(mergeUsers).toHaveBeenCalled();
    expect(store.set).toHaveBeenCalledWith('users', []);
  });
});
