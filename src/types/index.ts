export interface User {
  email: string;
  name: string;
  creditLimit: number;
  providers?: Provider[];
}

export interface Provider {
  key: string;
  providerName: string;
  createdAt: Date;
  creditLimit: number;
  creditUsed: number;
  project?: Project;
}

export interface Project {
  id: string;
  name: string;
}
