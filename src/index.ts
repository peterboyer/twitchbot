import "dotenv/config";
import { createClient } from "redis";
import { observable, autorun, toJS, runInAction } from "mobx";
import { Donation } from "./shared/donation";
import * as imap from "./index/imap";
import * as twitch from "./index/twitch";
import { getDonations } from "./index/get-donations";
import { redisRead, redisWrite } from "./index/redis";
import { getDonationMessage } from "./index/get-donation-message";
import { getAddedItems } from "./index/get-added-items";
import { Queue } from "./index/queue";

const DONATION_FROM = "info@wegive.com.au";
const DONATION_LIST_KEY = "donations_list";
const FORCE_RESTART = 30 * 60 * 1000; // 30 min -> seconds -> milliseconds
// const FORCE_RESTART = 5000; // 5 seconds

async function init() {
  const redis = createClient();
  redis.on("error", (err) => console.error(err));
  await redis.connect();
  if (process.env["REDIS_RESET"]) {
    await redisWrite(redis, DONATION_LIST_KEY, []);
  }

  const donations = observable(
    ((await redisRead<Donation[]>(redis, DONATION_LIST_KEY)) ?? []).map(
      (donation) => ({ username: undefined, ...donation } as Donation)
    )
  );
  autorun(() => {
    redisWrite(redis, DONATION_LIST_KEY, toJS(donations));
  });

  const queue = Queue();
  const chat = await twitch.listen();

  let mail: Awaited<ReturnType<typeof imap.listen>>;
  const createMailClient = async () => {
    mail = await imap.listen({
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

        mail.markRead(messages);
        runInAction(() => {
          donations.push(...pending);
        });

        for (const donation of pending) {
          queue.push(() => {
            chat.send(getDonationMessage(donation));
          });
        }
      },
      onDisconnect: () => {
        createMailClient();
      },
    });
  };

  createMailClient();
  setTimeout(() => {
    process.exit();
  }, FORCE_RESTART);
}

init();
