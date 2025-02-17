import { Provider } from './provider';

export interface User {
  email: string;
  name: string;
  providers: Provider[];
}

export function mergeUsers(users: User[] | User[][]): User[] {
  const items = users.flat();
  const mergedUsers = items.reduce<User[]>((acc, user) => {
    const existingUser = acc.find(u => u.email === user.email);
    if (existingUser) {
      existingUser.providers.push(...user.providers);
    } else {
      acc.push(user);
    }
    return acc;
  }, []);

  return mergedUsers;
}
