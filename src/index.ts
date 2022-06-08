import "dotenv/config";
import { createClient } from "redis";
import { observable, autorun, toJS } from "mobx";
import * as imap from "./index/imap";
import { Donation } from "./index/donation";
import { fetchUserDonations } from "./index/scrape";
import * as twitch from "./index/twitch";
import { redisRead, redisWrite } from "./index/redis";
import { handlePendingDonations } from "./index/handle-pending-donations";

const DONATION_FROM = "info@wegive.com.au";
const DONATION_LIST_KEY = "donations_list";

async function init() {
  const redis = createClient();
  redis.on("error", (err) => console.error(err));

  await redis.connect();
  const chat = await twitch.listen();

  if (process.env["REDIS_CLEAR"]) {
    // TODO
  }

  const donations = observable(
    (await redisRead<Donation[]>(redis, DONATION_LIST_KEY)) ?? []
  );
  autorun(() => {
    redisWrite(redis, DONATION_LIST_KEY, toJS(donations));
  });

  imap.listen({
    onMessages: async (messages) => {
      const hasDonationReceipt = messages.some(
        (message) => message.headers["from"]?.[0] === DONATION_FROM
      );
      if (!hasDonationReceipt) {
        console.log("no matching emails ...");
        return;
      }
      await handlePendingDonations({
        prev: toJS(donations),
        next: await fetchUserDonations(),
        send: chat.send,
      });
    },
  });
}

init();
