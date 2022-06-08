import { Message } from "./message";

export function getMessageSource(
  source: string | Message | Message[]
): string | string[] {
  if (typeof source === "string") {
    return source;
  }

  const messages = Array.isArray(source) ? source : [source];
  const ids: string[] = [];
  for (const message of messages) {
    const id = message.attributes["uid"];
    if (!(id && typeof id === "string")) {
      continue;
    }
    ids.push(id);
  }

  return ids;
}
