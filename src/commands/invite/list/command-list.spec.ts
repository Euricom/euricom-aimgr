import { createProvider } from '@/providers/ai-provider-factory';
import { displayTable } from '@/utils/display-table';
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

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('should fetch pending invites from providers', async () => {
    // arrange
    const mockProvider = {
      getInvites: vi.fn().mockResolvedValue(mockInvites),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await inviteListCommand({});

    // assert
    expect(mockProvider.getInvites).toHaveBeenCalled();
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('Invite List:'));
    expect(displayTable).toHaveBeenCalledWith(expect.arrayContaining(mockInvites));
  });

  it('should handle errors gracefully', async () => {
    // arrange
    const mockProvider = {
      getInvites: vi.fn().mockRejectedValue(new Error('Fetch error')),
      getName: vi.fn().mockReturnValue('openai'),
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
      getInvites: vi.fn().mockResolvedValue(mockInvites),
      getName: vi.fn().mockReturnValue('openai'),
    };
    const mockProvider2 = {
      getInvites: vi.fn().mockResolvedValue([]), // No invites from second provider
      getName: vi.fn().mockReturnValue('anthropic'),
    };
    (createProvider as Mock).mockReturnValueOnce(mockProvider1).mockReturnValueOnce(mockProvider2);

    // act
    await inviteListCommand({});

    // assert
    expect(mockProvider1.getInvites).toHaveBeenCalled();
    expect(mockProvider2.getInvites).toHaveBeenCalled();
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('Invite List:'));
    expect(displayTable).toHaveBeenCalledWith(expect.arrayContaining(mockInvites));
  });

  it('should handle no invites gracefully', async () => {
    // arrange
    const mockProvider = {
      getInvites: vi.fn().mockResolvedValue([]), // No invites
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await inviteListCommand({});

    // assert
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('Invite List:'));
    expect(displayTable).toHaveBeenCalledWith([{ email: '/', status: '/', provider: '/' }]); // Assuming this is the empty state
  });
});
