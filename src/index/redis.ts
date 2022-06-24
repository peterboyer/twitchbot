import { JSON } from "esresult";
import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

export async function redisRead<T>(
  redis: RedisClient,
  key: string
): Promise<T | undefined> {
  const valueJson = await redis.get(key);
  // console.log(`redis:read "${key}"="${valueJson}"`);
  console.log(`redis:read "${key}"`);
  if (!valueJson) {
    return undefined;
  }
  return JSON.parse(valueJson ?? "").orThrow() as T | undefined;
}

export async function redisWrite(
  redis: RedisClient,
  key: string,
  value: unknown
): Promise<void> {
  const valueJson = JSON.stringify(value).orThrow();
  await redis.set(key, valueJson);
  // console.log(`redis:write "${key}"="${valueJson}"`);
  console.log(`redis:write "${key}"`);
}
