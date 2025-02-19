export function normalizeString(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '');
}

export function normalizeEmail(email: string): string[] {
  return email
    .toLowerCase()
    .split('@')[0]
    .split('.')
    .map(part => part.replace(/\s+/g, ''));
}
