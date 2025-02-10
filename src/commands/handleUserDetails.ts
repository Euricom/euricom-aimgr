import chalk from "chalk";
import inquirer from "inquirer";
import { mockUsers } from "../data/mockData";

export async function handleUserDetails(userEmail?: string) {
  let email = userEmail;

  // If email is not provided, show the selection prompt
  if (!email) {
    const response = await inquirer.prompt([
      {
        type: "list",
        name: "email",
        message: "Select a user:",
        choices: mockUsers.map((u) => u.email),
      },
    ]);
    email = response.email;
  }

  const user = mockUsers.find((u) => u.email === email);

  if (!user) {
    console.log(chalk.red(`User with email ${email} not found`));
    return;
  }

  console.log(chalk.blue("\nUser Details:"));
  console.table([
    {
      Email: user.email,
      Name: user.name,
      "Credits Used": user.providers?.reduce(
        (total, p) => total + p.creditUsed,
        0
      ),
      "Credits Left": user.providers?.reduce(
        (total, p) => total + p.creditLimit - p.creditUsed,
        0
      ),
    },
  ]);

  console.log(chalk.gray("\nProvider Access:"));
  console.table(
    user.providers?.map((p) => ({
      Provider: p.providerName,
      "Credit Limit": p.creditLimit,
      "Credit Used": p.creditUsed,
      "Credit Left": p.creditLimit - p.creditUsed,
    }))
  );
}
