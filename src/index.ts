import "dotenv/config";
import * as twitch from "./twitch";
import * as imap from "./imap";
import { createClient } from "redis";
import { scrapeUserDonations } from "./scrape";

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

  imap.listen({
    onMessages: async (messages) => {
      const hasDonations = messages.some(
        (message) => message.headers["from"]?.[0] === "info@wegive.com.au"
      );
      if (!hasDonations) {
        console.log("no matches...");
        return;
      } else {
        console.log("matches...");
      }

      for (const message of messages) {
        console.log(
          `message: ${message.headers["from"]?.[0]} "${message.headers["subject"]?.[0]}"`
        );
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
