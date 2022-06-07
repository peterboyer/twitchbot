export function getDisplayName(options: {
  name: string;
  username?: string;
}): string {
  const { name, username } = options;
  if (username) {
    const atusername = `@${username}`;
    return name === "Anonymous" ? atusername : `${name} (${atusername})`;
  }
  return name;
}
