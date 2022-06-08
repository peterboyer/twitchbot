import { add } from "date-fns";
import fetch from "node-fetch";
import { Client } from "tmi.js";

import { getEnvOrThrow } from "./shared/env";

async function getAuthToken(config: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<{ token: string; expiry: Date }> {
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "refresh_token",
      refresh_token: config.refreshToken,
    }),
  });

  const { access_token, expires_in } = await response.json();

  return {
    token: access_token,
    expiry: add(new Date(), { seconds: expires_in }),
  };
}

export async function listen(): Promise<{
  send: (message: string) => Promise<void>;
}> {
  const config = {
    clientId: getEnvOrThrow("TWITCH_CLIENT_ID"),
    clientSecret: getEnvOrThrow("TWITCH_CLIENT_SECRET"),
    refreshToken: getEnvOrThrow("TWITCH_REFRESH_TOKEN"),
    username: getEnvOrThrow("TWITCH_USERNAME"),
    channel: getEnvOrThrow("TWITCH_CHANNEL"),
  };

  const { clientId, clientSecret, refreshToken } = config;
  const { token } = await getAuthToken({
    clientId,
    clientSecret,
    refreshToken,
  });

  const { username, channel } = config;
  const client = new Client({
    options: {
      debug: true,
    },
    identity: {
      username,
      password: `oauth:${token}`,
    },
    channels: [channel],
  });

  client.connect();

  client.on("message", (channel, _tags, message, self) => {
    if (self) return;
    const command = message.toLowerCase();
    if (command === "!test") {
      client.say(channel, "okay");
    }
  });

  return {
    send: async (message) => {
      await client.say(channel, message);
      return;
    },
  };
}
