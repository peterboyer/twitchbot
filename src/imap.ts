import Imap from "imap";

import { getEnvOrThrow } from "./env";

interface Message {
  id: number;
  buffer: string;
  headers: Record<string, string[]>;
  attributes: Record<string, unknown>;
}

export async function listen(options: {
  onMessage?: (message: Message) => void;
  onMessages?: (messages: Message[]) => void;
}) {
  const config = {
    user: getEnvOrThrow("IMAP_USER"),
    password: getEnvOrThrow("IMAP_PASSWORD"),
    host: getEnvOrThrow("IMAP_HOST"),
    port: parseInt(getEnvOrThrow("IMAP_PORT"), 10),
  };

  const { onMessage, onMessages } = options;

  const client = new Imap({
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port,
    tls: true,
    tlsOptions: {
      servername: config.host,
    },
  });

  client.once("ready", () => {
    console.log("ready");
    client.openBox("INBOX", false, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("connected");
      const parseUnread = () => {
        client.search(["UNSEEN"], (err, ids) => {
          if (err) {
            console.error(err);
            return;
          }
          if (!ids.length) {
            return;
          }
          console.log("search", ids);
          const $ = client.fetch(ids, { bodies: "" });
          const messages = new Map<number, Message>();
          const callback = (id: number, message: Message) => {
            messages.set(id, message);
            onMessage && onMessage(message);
            if (messages.size === ids.length) {
              onMessages && onMessages(Array.from(messages.values()));
            }
          };
          $.on("message", (msg, id) => {
            console.log(`message ${id}`);
            let buffer = "";
            let attributes: Record<string, string> = {};
            msg.on("body", (stream) => {
              stream.on("data", (chunk) => {
                buffer += chunk.toString("utf8");
              });
            });
            msg.once("attributes", (attrs) => {
              attributes = attrs;
            });
            msg.once("end", () => {
              const message: Message = {
                id,
                buffer,
                headers: Imap.parseHeader(buffer),
                attributes,
              };
              callback(id, message);
            });
          });
        });
      };
      client.on("mail", (...args: unknown[]) => {
        console.log("mail", ...args);
        parseUnread();
      });
      client.on("update", (...args: unknown[]) => {
        console.log("update", ...args);
        parseUnread();
      });
      console.log("initial read");
      parseUnread();
    });
  });

  client.once("close", () => {
    console.log("disconnected");
  });

  client.on("error", (err: unknown) => {
    console.error(err);
  });

  client.connect();
}
