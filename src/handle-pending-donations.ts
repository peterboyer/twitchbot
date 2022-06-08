import { Donation } from "./scrape";
import { getAddedItems } from "./get-added-items";
import { getDisplayName } from "./get-display-name";

export async function handlePendingDonations(options: {
  prev: Donation[];
  next: Donation[];
  send: (message: string) => Promise<void>;
}): Promise<void> {
  const { next } = options;
  if (!next.length) {
    return;
  }

  const { prev } = options;
  const pending = getAddedItems(prev, next);

  const { send } = options;
  await Promise.allSettled(
    pending.map((donation) =>
      (async () => {
        const { name, amount, username } = donation;
        const displayName = getDisplayName({ name, username });
        await send(
          [
            "DONATION!",
            `@${displayName} just donated ${amount} for the Cancer Council!`,
            "F**K CANCER!",
            "I appreciate each and every donation; type !donate in chat for link and instructions.",
          ].join(" ")
        );
      })()
    )
  );
}
