import { Queue } from "./queue";

const isBetween = (value: number, min: number, max: number) =>
  value >= min && value <= max;

it("should dispatch callbacks at set interval", async () => {
  const interval = 200;
  const queue = Queue({ intervalMilliseconds: interval });
  const start = new Date().getTime();
  const callback = jest.fn(() => new Date().getTime() - start);
  queue.push(callback, callback, callback, callback);
  await queue.drain();
  await queue.drain();
  for (const [index, result] of callback.mock.results.entries()) {
    expect(
      isBetween(result?.value, index * interval, index * interval + 50)
    ).toBeTruthy();
  }
});
