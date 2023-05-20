import { Redis } from "@upstash/redis/cloudflare";

export let redisClient: Redis;

export function setRedisClient(url: string, token: string) {
  redisClient = new Redis({ url, token });
}
