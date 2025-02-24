import { createProvider } from '@/providers/ai-provider-factory';
import consola from 'consola';
import { describe, expect, it, Mock, vi } from 'vitest';
import { inviteListCommand } from './command-list';

vi.mock('@/providers/ai-provider-factory');
vi.mock('@/utils/loading');
vi.mock('consola');
vi.mock('@/utils/display-table');

describe('inviteListCommand', () => {
  const mockInvites = [
    { email: 'invite1@example.com', status: 'pending', provider: 'openai' },
    { email: 'invite2@example.com', status: 'pending', provider: 'anthropic' },
  ];

  it('should fetch pending invites from providers', async () => {
    // arrange
    const mockProvider = {
      getPendingInvites: vi.fn().mockResolvedValue(mockInvites),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await inviteListCommand({});

    // assert
    expect(mockProvider.getPendingInvites).toHaveBeenCalled();
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('Invite List:'));
  });

  it('should handle errors gracefully', async () => {
    // arrange
    const mockProvider = {
      getPendingInvites: vi.fn().mockRejectedValue(new Error('Fetch error')),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await inviteListCommand({});

    // assert
    expect(consola.error).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should merge invites from multiple providers', async () => {
    // arrange
    const mockProvider1 = {
      getPendingInvites: vi.fn().mockResolvedValue(mockInvites),
    };
    const mockProvider2 = {
      getPendingInvites: vi.fn().mockResolvedValue([]), // No invites from second provider
    };
    (createProvider as Mock).mockReturnValueOnce(mockProvider1).mockReturnValueOnce(mockProvider2);

    // act
    await inviteListCommand({});

    // assert
    expect(mockProvider1.getPendingInvites).toHaveBeenCalled();
    expect(mockProvider2.getPendingInvites).toHaveBeenCalled();
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('Invite List:'));
  });
});
