import { Donation } from "../shared/donation";
import { getDisplayName } from "./get-donation-message/get-display-name";

export function getDonationMessage(donation: Donation) {
  const { name, amount, username } = donation;
  const displayName = getDisplayName({ name, username });
  const message = [
    "DONATION!",
    `${displayName} just donated ${amount} for the Cancer Council!`,
    "F**K CANCER!",
    "I appreciate each and every donation; type !donate in chat for link and instructions.",
  ].join(" ");
  return message;
}
