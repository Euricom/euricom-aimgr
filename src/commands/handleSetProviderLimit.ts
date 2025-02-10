import chalk from "chalk";

export async function handleSetProviderLimit(
  email: string,
  provider: string,
  limit: number
) {
  console.log(
    chalk.green(
      `Successfully set credit limit of ${limit} for provider ${provider} for user ${email}`
    )
  );
  console.table([
    {
      Provider: provider,
      User: email,
      "New Credit Limit": limit,
    },
  ]);
}
