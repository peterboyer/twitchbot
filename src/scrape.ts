import fetch from "node-fetch";
import * as cheerio from "cheerio";

const DONATION_URL =
  "https://spring2022.shitboxrally.com.au/2-bros-chillin-in-a-shitbox";
const reUsername = /\B@([a-z0-9_]+)\b/;

export async function scrapeUsernames(): Promise<string[]> {
  const response = await fetch(DONATION_URL);
  const html = await response.text();
  const $ = cheerio.load(html);
  const feed = $(".content");

  const usernames = new Set<string>();
  for (const element of feed) {
    const textelement = element.children[0];
    if (!textelement) {
      continue;
    }

    // cheerio isn't giving me the right type
    const message = (textelement as any).data;

    const match = message.match(reUsername);
    if (!match) {
      continue;
    }

    const [, username] = match as [never, string];
    usernames.add(username);
  }

  return Array.from(usernames.values());
}
