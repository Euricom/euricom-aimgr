import chalk from "chalk";

export async function handleRemoveProvider(email: string, provider: string) {
  console.log(
    chalk.green(`Successfully removed ${provider} provider from ${email}`)
  );
}
