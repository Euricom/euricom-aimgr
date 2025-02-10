import { Project, User } from "../types";

export const mockUsers: User[] = [
  {
    email: "john@example.com",
    name: "John Doe",
    creditLimit: 1000,
    providers: [
      {
        key: "sk-123456",
        providerName: "openai",
        project: {
          id: "proj-1",
          name: "Project Alpha",
        },
        createdAt: new Date("2024-01-01"),
        creditLimit: 1000,
        creditUsed: 100,
      },
    ],
  },
  {
    email: "jane@example.com",
    name: "Jane Smith",
    creditLimit: 1000,
    providers: [
      {
        key: "sk-123456",
        providerName: "openai",
        project: {
          id: "proj-1",
          name: "Project Alpha",
        },
        createdAt: new Date("2024-01-01"),
        creditLimit: 1000,
        creditUsed: 50,
      },
      {
        key: "sk-651234",
        providerName: "openrouter",
        createdAt: new Date("2024-01-01"),
        creditLimit: 1000,
        creditUsed: 50,
      },
      {
        key: "sk-651234",
        providerName: "anthropic",
        createdAt: new Date("2024-01-01"),
        creditLimit: 1000,
        creditUsed: 50,
      },
    ],
  },
];

export const mockProjects: Project[] = [
  {
    id: "proj-1",
    name: "Project Alpha",
  },
  {
    id: "proj-2",
    name: "Project Beta",
  },
];
