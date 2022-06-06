import "dotenv/config";
import * as twitch from "./twitch";
import * as imap from "./imap";
import { createClient } from "redis";
import { scrapeUsernames } from "./scrape";

const client = createClient();
client.on("error", (err) => console.error(err));
client.connect();

async function init() {
  const chat = await twitch.listen();

  const _usernames = await client.get("usernames");
  const $usernames = new Set<string>(_usernames ? JSON.parse(_usernames) : []);

  console.log("existing usernames", $usernames);

  function addUsername(username: string) {
    $usernames.add(username);
    client.set("usernames", JSON.stringify(Array.from($usernames.values())));
  }

  async function thankUserInChat(username: string, amount: string) {
    await chat.send(
      [
        "DONATION!",
        `@${username} donated ${amount} to the Cancer Council!`,
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

      const usernames = await scrapeUsernames();
      if (!usernames.length) {
        console.log("no usernames...");
      }

      for (const username of usernames) {
        if ($usernames.has(username)) {
          continue;
        }
        addUsername(username);
        // TODO: get $$$ donation amount for thank
        thankUserInChat(username, "$50.00");
      }
    },
  });
}

init();
