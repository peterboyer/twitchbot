import { Donation } from "../shared/donation";
import { getDisplayName } from "./get-donation-message/get-display-name";

export function getDonationMessage(donation: Donation) {
  const { name, amount, username } = donation;
  const displayName = getDisplayName({ name, username });
  const message = [
    "<3 DONATION! <3",
    `${displayName} just donated ${amount} towards the fight against cancer!`,
    "F**K CANCER!",
    "Thank you so much! I appreciate each and every donation.",
    "Type !fightcancer in chat for donation link and instructions.",
  ].join(" ");
  return message;
}
