import "dotenv/config";
// import * as twitch from "./twitch";
import * as imap from "./imap";
import { createClient } from "redis";

const client = createClient();

imap.listen({
  onMessages: (messages) => {
    const hasDonations = messages.some(
      (message) => message.headers["from"]?.[0] === "info@wegive.com.au"
    );
    if (!hasDonations) {
      console.log("no matches...");
      return;
    }
    for (const message of messages) {
      console.log(
        `message: ${message.headers["from"]?.[0]} "${message.headers["subject"]?.[0]}"`
      );
    }
  },
});
