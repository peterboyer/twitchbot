import { getMessageSource } from "./get-message-source";

test.each([
  ["*", "*"],
  ["123", "123"],
  [{ id: 1, buffer: "", headers: {}, attributes: { uid: "123" } }, ["123"]],
  [
    [
      { id: 1, buffer: "", headers: {}, attributes: { uid: "123" } },
      { id: 2, buffer: "", headers: {}, attributes: { uid: "456" } },
    ],
    ["123", "456"],
  ],
])("%j %j", (source, expected) => {
  const $ = getMessageSource(source);
  if (typeof $ === "string") {
    expect($).toBe(expected);
  } else {
    expect($).toMatchObject(expected);
  }
});
