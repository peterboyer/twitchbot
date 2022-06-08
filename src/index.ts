import "dotenv/config";
import { createClient } from "redis";
import { observable, autorun, toJS } from "mobx";
import { Donation } from "./shared/donation";
import * as imap from "./index/imap";
import * as twitch from "./index/twitch";
import { getDonations } from "./index/get-donations";
import { redisRead, redisWrite } from "./index/redis";
import { getDonationMessage } from "./index/get-donation-message";
import { getAddedItems } from "./index/get-added-items";

const DONATION_FROM = "info@wegive.com.au";
const DONATION_LIST_KEY = "donations_list";

async function init() {
  const redis = createClient();
  redis.on("error", (err) => console.error(err));

  await redis.connect();
  const chat = await twitch.listen();

  const donations = observable(
    (await redisRead<Donation[]>(redis, DONATION_LIST_KEY)) ?? []
  );
  autorun(() => {
    redisWrite(redis, DONATION_LIST_KEY, toJS(donations));
  });

  const mail = await imap.listen({
    criteria: ["UNSEEN", ["FROM", DONATION_FROM]],
    onMessages: async (messages) => {
      const next = await getDonations();
      if (!next.length) {
        return;
      }

      const prev = toJS(donations);
      const pending = getAddedItems(prev, next);
      console.log("New Donations:");
      console.log(pending);

      await Promise.all(
        pending.map((donation) => {
          chat.send(getDonationMessage(donation));
        })
      );

      donations.push(...pending);
      mail.markRead(messages);
    },
  });
}

init();
