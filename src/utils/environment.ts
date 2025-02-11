import { logger } from './logger';

const MIN_NODE_VERSION = 18;
const RADIX = 10;
const EXIT_ERROR = 1;

/**
 * Validates the runtime environment requirements
 * @throws {Error} If requirements are not met
 */
export function validateEnvironment(): void {
  const nodeVersion = process.versions.node;
  const majorVersion = parseInt(nodeVersion.split('.')[0], RADIX);

  if (MIN_NODE_VERSION > majorVersion) {
    logger.error('Error: Node.js version 18 or higher is required.');
    logger.error('Current version:', nodeVersion);
    logger.error('Please upgrade your Node.js installation.');
    process.exit(EXIT_ERROR);
  }
}
