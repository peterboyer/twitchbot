import { handlePendingDonations } from "./handle-pending-donations";

it("should send no messages if no next", async () => {
  const send = jest.fn(async () => undefined);
  await handlePendingDonations({
    prev: [{ name: "Hello", amount: "$10.00" }],
    next: [],
    send,
  });
  expect(send).toHaveBeenCalledTimes(0);
});

it("should send only new messages", async () => {
  const send = jest.fn(async (_message: string) => undefined);
  await handlePendingDonations({
    prev: [{ name: "Hello", amount: "$10.00" }],
    next: [
      { name: "Hello", amount: "$10.00" },
      { name: "Hello", amount: "$10.00" },
      { name: "World", amount: "$20.00" },
    ],
    send,
  });
  expect(send).toHaveBeenCalledTimes(2);
  expect(send.mock.calls[0]?.[0].includes("Hello")).toBeTruthy();
  expect(send.mock.calls[1]?.[0].includes("World")).toBeTruthy();
});
