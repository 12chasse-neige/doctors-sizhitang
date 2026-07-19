import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ quiet: true });

const envSchema = z.object({
  WECHAT_APP_ID: z.string().min(1).optional(),
  WECHAT_APP_SECRET: z.string().min(1).optional(),
  WECHAT_API_BASE: z.string().url().default("https://api.weixin.qq.com"),
  WECHAT_TOKEN_CACHE: z.string().default(".cache/wechat-access-token.json"),
});

export type WechatConfig = {
  appId: string;
  appSecret: string;
  apiBase: string;
  tokenCache: string;
};

export function inspectConfig() {
  const env = envSchema.parse(process.env);
  return {
    appIdConfigured: Boolean(env.WECHAT_APP_ID),
    appSecretConfigured: Boolean(env.WECHAT_APP_SECRET),
    apiBase: env.WECHAT_API_BASE,
    tokenCache: path.resolve(env.WECHAT_TOKEN_CACHE),
  };
}

export function getWechatConfig(): WechatConfig {
  const env = envSchema.extend({
    WECHAT_APP_ID: z.string().min(1, "缺少 WECHAT_APP_ID"),
    WECHAT_APP_SECRET: z.string().min(1, "缺少 WECHAT_APP_SECRET"),
  }).parse(process.env);

  return {
    appId: env.WECHAT_APP_ID,
    appSecret: env.WECHAT_APP_SECRET,
    apiBase: env.WECHAT_API_BASE.replace(/\/$/, ""),
    tokenCache: path.resolve(env.WECHAT_TOKEN_CACHE),
  };
}
