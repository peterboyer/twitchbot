import "dotenv/config";
import { createClient } from "redis";
import { observable, autorun, toJS } from "mobx";
import { Donation } from "./shared/donation";
import * as imap from "./index/imap";
import * as twitch from "./index/twitch";
import { getUserDonations } from "./index/get-user-donations";
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

  imap.listen({
    onMessages: async (messages) => {
      const hasDonationReceipt = messages.some(
        (message) => message.headers["from"]?.[0] === DONATION_FROM
      );
      if (!hasDonationReceipt) {
        return;
      }

      const next = await getUserDonations();
      if (!next.length) {
        return;
      }

      const prev = toJS(donations);
      const pending = getAddedItems(prev, next);

      await Promise.all(
        pending.map((donation) => {
          chat.send(getDonationMessage(donation));
        })
      );

      donations.push(...pending);
    },
  });
}

init();
