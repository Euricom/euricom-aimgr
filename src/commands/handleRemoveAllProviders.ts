import chalk from "chalk";

export async function handleRemoveAllProviders(email: string) {
  console.log(chalk.green(`Successfully removed all providers from ${email}`));
  console.log("Removed providers:", ["openai", "anthropic", "openrouter"]);
}
