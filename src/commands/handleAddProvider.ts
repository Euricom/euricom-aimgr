import chalk from "chalk";
import { mockUsers } from "../data/mockData";
import { Provider } from "../types";

export async function handleAddProvider(email: string, providerName: string) {
  const user = mockUsers.find((u) => u.email === email);

  if (!user) {
    console.log(chalk.red(`User with email ${email} not found`));
    return;
  }

  // Check if provider already exists for user
  if (user.providers?.some((p) => p.providerName === providerName)) {
    console.log(
      chalk.yellow(`Provider ${providerName} already exists for user ${email}`)
    );
    return;
  }

  const dummyApiKey = "sk_" + Math.random().toString(36).substring(2, 15);

  const newProvider: Provider = {
    key: dummyApiKey,
    providerName,
    createdAt: new Date(),
    creditLimit: 1000,
    creditUsed: 0,
  };

  if (!user.providers) {
    user.providers = [];
  }
  user.providers.push(newProvider);

  console.log(chalk.green("\nProvider added successfully!"));
  console.log(chalk.blue("\nProvider Details:"));
  console.table([
    {
      User: email,
      Provider: providerName,
      "API Key": dummyApiKey,
      "Credit Limit": newProvider.creditLimit,
    },
  ]);
}
