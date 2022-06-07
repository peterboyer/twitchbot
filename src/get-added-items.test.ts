import { getAddedItems } from "./get-added-items";

const prev = [{ name: "User", amount: "$10.00" }];

it("should return no items", () => {
  const next = [...prev];
  const $ = getAddedItems(prev, next);
  expect($).toMatchObject([]);
});

it("should return one added item", () => {
  const next = [...prev, { name: "Foo", amount: "$20.00" }];
  const $ = getAddedItems(prev, next);
  expect($).toMatchObject([{ name: "Foo", amount: "$20.00" }]);
});

it("should return one added item, despite a removal", () => {
  const next = [{ name: "Foo", amount: "$20.00" }];
  const $ = getAddedItems(prev, next);
  expect($).toMatchObject([{ name: "Foo", amount: "$20.00" }]);
});
