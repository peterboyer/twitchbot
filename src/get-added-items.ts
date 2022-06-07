import hashSum from "hash-sum";
import { diffArrays } from "diff";

const comparator = (left: unknown, right: unknown) => {
  return hashSum(left) === hashSum(right);
};

export function getAddedItems<T>(prev: T[], next: T[]): T[] {
  const updates = diffArrays(prev, next, { comparator });
  const lastUpdate = updates.pop();
  if (!lastUpdate) {
    return [];
  }
  const { added, value } = lastUpdate;
  if (!added) {
    return [];
  }
  return value;
}
