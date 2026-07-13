/**
 * @shopify/shopify-api SDK 初始化
 *
 * 注册 Node.js 适配器后创建 shopifyApi 实例，
 * 所有 OAuth / API 调用都通过此实例进行。
 */
import "@shopify/shopify-api/adapters/node";
import { shopifyApi, LATEST_API_VERSION, type Shopify } from "@shopify/shopify-api";
import dotenv from "dotenv";

dotenv.config();

let shopify: Shopify;

export function getShopify(): Shopify {
  if (!shopify) {
    const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_SCOPES, SASS_APP_URL } =
      process.env;

    if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET) {
      throw new Error(
        "缺少必需的环境变量: SHOPIFY_API_KEY, SHOPIFY_API_SECRET"
      );
    }

    // SASS_APP_URL 可选：有则作为静态 hostName 兜底，
    // 否则由 src/app.ts 中的中间件动态从请求 Host 头设置
    const hostName = SASS_APP_URL
      ? SASS_APP_URL.replace(/^https?:\/\//, "").replace(/\/$/, "")
      : "localhost:3000";

    shopify = shopifyApi({
      apiKey: SHOPIFY_API_KEY,
      apiSecretKey: SHOPIFY_API_SECRET,
      scopes: (SHOPIFY_SCOPES ?? "write_products,read_customers").split(","),
      hostName,
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: false,
    });
  }
  return shopify;
}
