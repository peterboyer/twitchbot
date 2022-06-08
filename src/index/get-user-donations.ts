import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { Donation } from "../shared/donation";

const DONATION_URL =
  "https://spring2022.shitboxrally.com.au/2-bros-chillin-in-a-shitbox";

const reAlias = /\B@([a-z0-9_]+)\b/;
const reNameAndAmount = /(.+) gave (.+)/;

export async function getUserDonations(): Promise<Donation[]> {
  const donations: Donation[] = [];

  const response = await fetch(DONATION_URL);
  const html = await response.text();

  const $ = cheerio.load(html);
  const items = $(".post");

  for (const item of items) {
    const title = $(".heading", item).text();
    const message = $(".content", item).text();

    const [, username] = (message.toLowerCase().match(reAlias) ?? []) as (
      | string
      | undefined
    )[];
    const [, name, amount] = (title.match(reNameAndAmount) ?? []) as (
      | string
      | undefined
    )[];

    if (!(name && amount)) {
      throw new TypeError("name and amount not found, check scraper");
    }

    donations.push({
      name,
      amount,
      username,
    });
  }

  return donations;
}
