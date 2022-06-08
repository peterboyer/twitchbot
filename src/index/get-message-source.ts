import { Message } from "./message";

export type Source = string | Message | Message[];

export function getMessageSource(source: Source): string | string[] {
  if (typeof source === "string") {
    return source;
  }

  const messages = Array.isArray(source) ? source : [source];
  const ids: string[] = [];
  for (const message of messages) {
    const id = message.attributes["uid"];
    if (!(id && (typeof id === "string" || typeof id === "number"))) {
      continue;
    }
    ids.push(`${id}`);
  }

  return ids;
}
