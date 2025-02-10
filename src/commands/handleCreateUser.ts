import chalk from "chalk";
import { mockUsers } from "../data/mockData";
import { User } from "../types";

export async function handleCreateUser(email: string, name: string) {
  const user: User = {
    email,
    name,
    providers: [],
    creditLimit: 1000,
  };

  mockUsers.push(user);

  console.log(chalk.green("User created successfully!"));
  console.log(chalk.blue("User details:"));
  console.table([user]);
}
