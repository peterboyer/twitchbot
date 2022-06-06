import fetch from "node-fetch";
import * as cheerio from "cheerio";

const DONATION_URL =
  "https://spring2022.shitboxrally.com.au/2-bros-chillin-in-a-shitbox";

const reUsername = /\B@([a-z0-9_]+)\b/;
function parseUsername(input: string): string | null {
  const match = input.match(reUsername);
  if (!match) {
    return null;
  }

  const [, value] = match as [never, string];
  return value;
}

const reDonation = /^.*\s(\$\d+\.\d+)\.$/;
function parseDonation(input: string): string | null {
  const match = input.match(reDonation);
  if (!match) {
    return null;
  }

  const [, value] = match as [never, string];
  return value;
}

export async function scrapeUserDonations(): Promise<Record<string, string>> {
  const map = new Map<string, string>();
  const response = await fetch(DONATION_URL);
  const html = await response.text();

  const $ = cheerio.load(html);
  const list = $(".posts-container");
  const items = $(".post", list);

  for (const item of items.children()) {
    const title = $(".heading", item).text();
    const message = $(".content", item).text();
    const username = parseUsername(message);
    if (!username) {
      continue;
    }
    const donation = parseDonation(title);
    if (!donation) {
      throw new TypeError("unable to parse donation");
    }
    map.set(username, donation);
  }

  return Object.fromEntries(map.entries());
}
