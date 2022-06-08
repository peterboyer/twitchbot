import { getDisplayName } from "./get-display-name";

test.each([
  [{ name: "Foo Bar", username: undefined }, "Foo Bar"],
  [{ name: "Foo Bar", username: "foobar" }, "Foo Bar (@foobar)"],
  [{ name: "Anonymous", username: undefined }, "Anonymous"],
  [{ name: "Anonymous", username: "foobar" }, "@foobar"],
])("%j %s", (input, expected) => {
  expect(getDisplayName(input)).toBe(expected);
});
