import EventEmitter from "events";

type AnyFunction = (...args: any[]) => any;

export interface Queue {
  /**
   * Add new items to the queue and start dispatching them.
   */
  push(...args: AnyFunction[]): void;
  /**
   * Await until all queue items have been dispatched.
   */
  drain(): Promise<void>;
}

export function Queue(options: { intervalMilliseconds?: number } = {}): Queue {
  const emitter = new EventEmitter();
  const queue = new Set<AnyFunction>();
  const { intervalMilliseconds = 2000 } = options;

  let currentTimeout: NodeJS.Timeout | undefined = undefined;
  const pop = () => {
    // skip, if queue empty
    if (!queue.size) {
      return;
    }

    // skip, if a queue item is already scheduled
    if (currentTimeout) {
      return;
    }

    const item = queue.entries().next();
    const [, callback] = (item.value ?? []) as [never, AnyFunction | undefined];
    if (!callback) {
      throw new TypeError("invariant: first entry must have a value");
    }

    currentTimeout = setTimeout(() => {
      clearTimeout(currentTimeout);
      currentTimeout = undefined;
      pop();
    }, intervalMilliseconds);

    queue.delete(callback);
    setTimeout(callback, 0);
    emitter.emit("pop");
  };

  return {
    push: (...callbacks) => {
      for (const callback of callbacks) {
        queue.add(() => callback());
      }
      pop();
    },
    drain: () =>
      new Promise((resolve) => {
        const callback = (): void => {
          if (queue.size) {
            return;
          }
          emitter.off("pop", callback);
          resolve();
        };
        emitter.on("pop", callback);
        callback();
      }),
  };
}
