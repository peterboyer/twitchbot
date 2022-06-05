export function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new TypeError(`Configuration option ${key} not set.`);
  }
  return value;
}
