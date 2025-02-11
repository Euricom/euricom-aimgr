import { User } from '../types';

export const mockUsers: User[] = [
  {
    creditLimit: 1000,
    email: 'john@example.com',
    name: 'John Doe',
    providers: [
      {
        createdAt: new Date('2024-01-01'),
        creditLimit: 1000,
        creditUsed: 100,
        key: 'sk-123456',
        project: {
          id: 'proj-1',
          name: 'Project Alpha',
        },
        providerName: 'openai',
      },
    ],
  },
  {
    creditLimit: 1000,
    email: 'jane@example.com',
    name: 'Jane Smith',
    providers: [
      {
        createdAt: new Date('2024-01-01'),
        creditLimit: 1000,
        creditUsed: 50,
        key: 'sk-123456',
        project: {
          id: 'proj-1',
          name: 'Project Alpha',
        },
        providerName: 'openai',
      },
      {
        createdAt: new Date('2024-01-01'),
        creditLimit: 1000,
        creditUsed: 50,
        key: 'sk-651234',
        providerName: 'openrouter',
      },
      {
        createdAt: new Date('2024-01-01'),
        creditLimit: 1000,
        creditUsed: 50,
        key: 'sk-651234',
        providerName: 'anthropic',
      },
    ],
  },
];
