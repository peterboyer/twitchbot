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
  });
}
