/**
 * Validates the runtime environment requirements
 * @throws {Error} If requirements are not met
 */
export function validateEnvironment(): void {
  const nodeVersion = process.versions.node;
  const majorVersion = parseInt(nodeVersion.split('.')[0], 10);

  if (majorVersion < 18) {
    console.error('Error: Node.js version 18 or higher is required.');
    console.error('Current version:', nodeVersion);
    console.error('Please upgrade your Node.js installation.');
    process.exit(1);
  }
}
