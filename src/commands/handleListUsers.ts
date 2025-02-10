import chalk from "chalk";
import inquirer from "inquirer";
import { mockUsers } from "../data/mockData";

export async function handleListUsers(filterEmail?: string) {
  // If filterEmail is not provided, prompt for it
  if (filterEmail === undefined) {
    const response = await inquirer.prompt([
      {
        type: "input",
        name: "filterEmail",
        message: "Filter users by email (leave empty for all):",
        default: "",
      },
    ]);
    filterEmail = response.filterEmail;
  }

  const filteredUsers = mockUsers
    .filter((u) =>
      filterEmail
        ? u.email.toLowerCase().includes(filterEmail.toLowerCase().trim())
        : true
    )
    .map((u) => ({
      Email: u.email,
      Name: u.name,
      "Active Providers": u.providers
        ? `(${u.providers.length}) ${u.providers
            .map((p) => p.providerName)
            .join(", ")}`
        : "None",
      "Credit Limit": u.creditLimit,
    }));

  if (filteredUsers.length === 0) {
    console.log(chalk.yellow("No users found matching the filter."));
    return;
  }

  console.log(chalk.blue("\nUser List:"));
  console.table(filteredUsers);
  console.log(chalk.gray(`Total users shown: ${filteredUsers.length}`));
}
