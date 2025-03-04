import { consola } from 'consola';

export function handleError(error: unknown) {
  if (error instanceof Error) {
    consola.error(error.message);
  } else {
    consola.error('An unknown error occurred', error);
  }
}
