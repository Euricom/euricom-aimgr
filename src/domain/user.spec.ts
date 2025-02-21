import { describe, expect, it } from 'vitest';
import { mergeUsers, User } from './user';

describe('mergeUsers', () => {
  it('should merge duplicate users in a flat array', () => {
    const users: User[] = [
      {
        email: 'test@example.com',
        name: 'Test User',
        providers: [{ name: 'a', creditsUsed: 0, apiKeys: [] }],
      },
      {
        email: 'test@example.com',
        name: 'Test User',
        providers: [{ name: 'b', creditsUsed: 0, apiKeys: [] }],
      },
      {
        email: 'other@example.com',
        name: 'Other User',
        providers: [{ name: 'c', creditsUsed: 0, apiKeys: [] }],
      },
    ];

    const result = mergeUsers(users);
    expect(result).toHaveLength(2);
    const testUser = result.find(u => u.email === 'test@example.com');
    expect(testUser?.providers).toContainEqual({ name: 'a', creditsUsed: 0, apiKeys: [] });
    expect(testUser?.providers).toContainEqual({ name: 'b', creditsUsed: 0, apiKeys: [] });
  });

  it('should merge users in nested arrays', () => {
    const users: User[][] = [
      [
        {
          email: 'nested@example.com',
          name: 'Nested User',
          providers: [{ name: 'a', creditsUsed: 0, apiKeys: [] }],
        },
        {
          email: 'another@example.com',
          name: 'Other User',
          providers: [{ name: 'b', creditsUsed: 0, apiKeys: [] }],
        },
      ],
      [
        {
          email: 'nested@example.com',
          name: 'Nested User',
          providers: [{ name: 'c', creditsUsed: 0, apiKeys: [] }],
        },
      ],
    ];

    const result = mergeUsers(users);
    expect(result).toHaveLength(2);
    const nestedUser = result.find(u => u.email === 'nested@example.com');
    expect(nestedUser?.providers).toContainEqual({ name: 'a', creditsUsed: 0, apiKeys: [] });
    expect(nestedUser?.providers).toContainEqual({ name: 'c', creditsUsed: 0, apiKeys: [] });

    const otherUser = result.find(u => u.email === 'another@example.com');
    expect(otherUser?.providers).toContainEqual({ name: 'b', creditsUsed: 0, apiKeys: [] });
  });
});
