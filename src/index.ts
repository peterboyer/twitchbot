import "dotenv/config";
import * as cheerio from "cheerio";
import { createClient } from "redis";
import * as imap from "./imap";
import { scrapeUserDonations } from "./scrape";
import * as twitch from "./twitch";

const redis = createClient();
redis.on("error", (err) => console.error(err));
redis.connect();

async function init() {
  const chat = await twitch.listen();

  if (process.env["REDIS_CLEAR"]) {
    await redis.set("usernames", "[]");
  }

  const _usernames = await redis.get("usernames");
  const $usernames = new Set<string>(_usernames ? JSON.parse(_usernames) : []);
  console.log("existing usernames", $usernames);
  const _receipts = await redis.get("receipts");
  const $receipts = new Set<string>(_receipts ? JSON.parse(_receipts) : []);
  console.log("existing receipts", $receipts);

  function addUsername(username: string) {
    $usernames.add(username);
    redis.set("usernames", JSON.stringify(Array.from($usernames.values())));
  }

  async function thankUserInChat(username: string, amount: string) {
    await chat.send(
      [
        "DONATION!",
        `@${username} just donated ${amount} for the Cancer Council!`,
        "F**K CANCER!",
        "I appreciate each and every donation; type !donate in chat for link and instructions.",
      ].join(" ")
    );
    return;
  }

  const DONATION_FROM = "info@wegive.com.au";
  const reSubjectReceiptId = /\b(\w+)$/;
  const reBodyContent = />(.+) has donated (.+)</;

  imap.listen({
    onMessages: async (messages) => {
      const donationMessages = messages.filter(
        (message) => message.headers["from"]?.[0] === DONATION_FROM
      );
      if (!donationMessages.length) {
        console.log("no matches...");
        return;
      } else {
        console.log("matches...");
      }

      for (const message of messages) {
        const from = message.headers["from"]?.[0];
        if (from !== DONATION_FROM) {
          continue;
        }
        const subject = message.headers["subject"]?.[0];
        if (!subject) {
          throw new TypeError("no subject");
        }
        const [, receiptId] = (subject.match(reSubjectReceiptId) ?? []) as
          | (undefined | string)[];
        if (!receiptId) {
          throw new TypeError("no receipt id found");
        }

        const buffer = message.buffer;
        const [, name, donation] = (buffer.match(reBodyContent) ?? []) as (
          | undefined
          | string
        )[];
        if (!(name && donation)) {
          throw new TypeError("no name,donation match string");
        }

        console.log(`donation "${receiptId}": ${name} of ${donation}`);
      }

      const map = new Map<string, string>(
        Object.entries(await scrapeUserDonations())
      );
      if (!map.size) {
        console.log("no map items...");
      }

      for (const [username, donation] of map) {
        if ($usernames.has(username)) {
          continue;
        }
        addUsername(username);
        thankUserInChat(username, donation);
      }
    },
  });
}

init();
