import Imap from "imap";
import { getEnvOrThrow } from "./env";

export async function listen() {
  const config = {
    user: getEnvOrThrow("IMAP_USER"),
    password: getEnvOrThrow("IMAP_PASSWORD"),
    host: getEnvOrThrow("IMAP_HOST"),
    port: parseInt(getEnvOrThrow("IMAP_PORT"), 10),
  };

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
    client.openBox("INBOX", false, (err, mailbox) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("connected", mailbox);
      client.on("mail", console.log);
      client.on("update", console.log);
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
