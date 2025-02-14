import { Provider } from './provider';

export interface User {
  email: string;
  name: string;
  providers: Provider[];
}

// TODO: unit test
export function mergeUsers(users: User[] | User[][]): User[] {
  const items = users.flat();
  const mergedUsers: User[] = [];

  // TODO: refactor with reduce (maybe better)
  items.forEach(user => {
    const existingUser = mergedUsers.find(u => u.email === user.email);
    if (existingUser) {
      existingUser.providers.push(...user.providers);
    } else {
      mergedUsers.push(user);
    }
  });

  return mergedUsers;
}
