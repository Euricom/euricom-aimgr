import chalk from "chalk";

export async function handleListProviders() {
  // Dummy providers list
  const providers = [
    { name: "openai" },
    { name: "anthropic" },
    { name: "openrouter" },
  ];

  console.log(chalk.blue("\nAvailable Providers:"));
  console.table(providers);
}
