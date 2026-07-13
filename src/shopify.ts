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

    if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET || !SASS_APP_URL) {
      throw new Error(
        "缺少必需的环境变量: SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SASS_APP_URL"
      );
    }

    const hostName = SASS_APP_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");

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
