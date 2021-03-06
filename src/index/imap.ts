import Imap from "imap";
import mailparser from "mailparser";
import { getEnvOrThrow } from "./shared/env";
import { Message } from "./shared/message";
import { getMessageSource, Source } from "./imap/get-message-source";

export async function listen(options: {
  mailbox?: string;
  criteria?: (string | string[])[];
  onMessage?: (message: Message) => void;
  onMessages?: (messages: Message[]) => void;
  onDisconnect?: () => void;
}): Promise<{
  markRead(source: Source): Promise<void>;
}> {
  const config = {
    user: getEnvOrThrow("IMAP_USER"),
    password: getEnvOrThrow("IMAP_PASSWORD"),
    host: getEnvOrThrow("IMAP_HOST"),
    port: parseInt(getEnvOrThrow("IMAP_PORT"), 10),
  };

  const { onMessage, onMessages, onDisconnect } = options;

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

  const mailbox = options.mailbox ?? "INBOX";
  const criteria = options.criteria ?? ["UNSEEN"];

  client.once("ready", () => {
    client.openBox(mailbox, false, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      const parseUnread = () => {
        client.search(criteria, (err, ids) => {
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
            msg.once("end", async () => {
              const parsed = await mailparser.simpleParser(buffer);
              const message: Message = {
                id,
                buffer: parsed.html || "",
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
    onDisconnect && onDisconnect();
  });

  client.on("error", (err: unknown) => {
    console.error(err);
  });

  client.connect();

  return {
    markRead: async (_source) => {
      const source = getMessageSource(_source);
      return new Promise((resolve, reject) => {
        client.setFlags(source, "\\Seen", (err) =>
          err ? reject(err) : resolve()
        );
      });
    },
  };
}
