import { AIProvider } from '@/providers/ai-provider';
import { createProvider } from '@/providers/ai-provider-factory';
import * as loading from '@/utils/loading';
import consola from 'consola';
import { describe, expect, it, Mock, vi } from 'vitest';
import { userAssignCommand } from './command-assign';

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

vi.mock('@/providers/ai-provider-factory', () => ({
  createProvider: vi.fn(() => mockAIProvider),
}));

describe('userAssignCommand', () => {
  const email = 'user@example.com';
  const options = { provider: 'openai' };

  it('should assign user to provider', async () => {
    vi.spyOn(mockAIProvider, 'getUserFromProvider').mockResolvedValue({
      providerName: 'mockProvider',
      userName: 'user',
      userId: '123',
    });
    vi.spyOn(mockAIProvider, 'assignUserToWorkspace').mockResolvedValue(true);

    await userAssignCommand(email, options);

    expect(loading.succeed).toHaveBeenCalledWith(`Assigned ${email} to mockProvider.`);
  });

  it('should handle user already assigned', async () => {
    vi.spyOn(mockAIProvider, 'getUserFromProvider').mockResolvedValue({
      providerName: 'mockProvider',
      userName: 'user',
      userId: '123',
    });
    vi.spyOn(mockAIProvider, 'getUserWorkspace').mockResolvedValue({
      workspaceName: 'mockWorkspace',
      workspaceId: '123',
      workspaceUrl: 'https://example.com/workspace',
    });

    await userAssignCommand(email, options);

    expect(loading.warn).toHaveBeenCalledWith(`${email} is already assigned to mockProvider.`);
  });

  it('should handle user not a member of provider', async () => {
    vi.spyOn(mockAIProvider, 'getUserFromProvider').mockResolvedValue(undefined);

    await userAssignCommand(email, options);

    expect(loading.warn).toHaveBeenCalledWith(`${email} is not a member of mockProvider.`);
  });

  it('should handle assignment failure', async () => {
    vi.spyOn(mockAIProvider, 'getUserFromProvider').mockResolvedValue({
      providerName: 'mockProvider',
      userName: 'user',
      userId: '123',
    });
    vi.spyOn(mockAIProvider, 'getUserWorkspace').mockResolvedValue(undefined);
    vi.spyOn(mockAIProvider, 'assignUserToWorkspace').mockResolvedValue(false);

    await userAssignCommand(email, options);

    expect(loading.fail).toHaveBeenCalledWith(`Failed to assign ${email} to mockProvider.`);
  });

  it('should handle errors gracefully', async () => {
    const mockProvider = 'fake provider';
    (createProvider as Mock).mockReturnValue(mockProvider);

    await userAssignCommand(email, options);

    expect(consola.error).toHaveBeenCalled();
  });
});
