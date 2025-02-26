import { createProvider } from '@/providers/ai-provider-factory';
import consola from 'consola';
import { describe, expect, it, Mock, vi } from 'vitest';
import { userAssignCommand } from './command-assign';

vi.mock('@/providers/ai-provider-factory');
vi.mock('@/utils/loading');
vi.mock('consola');

describe('userAssignCommand', () => {
  const email = 'user@example.com';
  const options = { provider: 'openai' };

  beforeEach(() => {
    vi.clearAllMocks(); // Reset mocks before each test
  });

  it('should assign user to provider', async () => {
    const mockProvider = {
      isUserMemberOfProvider: vi.fn().mockResolvedValue(true),
      isUserAssignedToProvider: vi.fn().mockResolvedValue(false),
      getUserFromProvider: vi.fn().mockResolvedValue({
        providerName: 'openai',
        userName: 'user',
        userId: '123',
      }),
      getUserWorkspace: vi.fn().mockResolvedValue(undefined),
      assignUserToWorkspace: vi.fn().mockResolvedValue(true),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    await userAssignCommand(email, options);

    expect(consola.success).toHaveBeenCalledWith(`\n${email} was assigned to openai.`);
  });

  it('should handle user already assigned', async () => {
    const mockProvider = {
      isUserMemberOfProvider: vi.fn().mockResolvedValue(true), // User is a member
      getUserFromProvider: vi.fn().mockResolvedValue({
        providerName: 'openai',
        userName: 'user',
        userId: '123',
      }),
      getUserWorkspace: vi.fn().mockResolvedValue({
        workspaceId: '123',
        workspaceName: 'workspace',
      }),
      assignUserToWorkspace: vi.fn().mockResolvedValue(false),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    await userAssignCommand(email, options);

    expect(consola.warn).toHaveBeenCalledWith(`\n${email} is already assigned to openai.`);
  });

  it('should handle user not a member of provider', async () => {
    const mockProvider = {
      isUserMemberOfProvider: vi.fn().mockResolvedValue(false),
      getUserFromProvider: vi.fn().mockResolvedValue(undefined),
      assignUserToWorkspace: vi.fn(),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    await userAssignCommand(email, options);

    expect(consola.warn).toHaveBeenCalledWith(`\n${email} is not a member of openai.`);
  });

  it('should handle assignment failure', async () => {
    const mockProvider = {
      isUserMemberOfProvider: vi.fn().mockResolvedValue(true),
      isUserAssignedToProvider: vi.fn().mockResolvedValue(false),
      getUserFromProvider: vi.fn().mockResolvedValue({
        providerName: 'openai',
        userName: 'user',
        userId: '123',
      }),
      getUserWorkspace: vi.fn().mockResolvedValue(undefined),
      assignUserToWorkspace: vi.fn().mockResolvedValue(false),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    await userAssignCommand(email, options);

    expect(consola.warn).toHaveBeenCalledWith(`\nFailed to assign ${email} to openai.`);
  });

  it('should handle errors gracefully', async () => {
    const mockProvider = 'fake provider';
    (createProvider as Mock).mockReturnValue(mockProvider);

    await userAssignCommand(email, options);

    expect(consola.error).toHaveBeenCalled();
  });
});
