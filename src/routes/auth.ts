/**
 * OAuth 授权路由
 *
 * GET  /auth          - Step 1: 开始 OAuth，重定向到 Shopify 授权页
 * GET  /auth/callback - Step 3&4: 处理回调，验证并换取 Access Token
 *
 * 安全校验（HMAC / nonce / shop）全部由 @shopify/shopify-api SDK 内部处理。
 */

import { Router, type Request, type Response } from "express";
import { getShopify } from "../shopify.js";
import { memorySessionStorage } from "../session-store.js";

const router = Router();

// -------------------------------------------------------------------
// Step 1: 开始 OAuth
// 访问: /auth?shop=mystore.myshopify.com
// -------------------------------------------------------------------
router.get("/auth", async (req: Request, res: Response) => {
  const shop = req.query.shop as string | undefined;

  if (!shop) {
    return res.status(400).send("缺少 shop 参数");
  }

  try {
    const shopify = getShopify();
    // v11 的 auth.begin() 通过 adapter 自动设置响应头并 end() 响应
    await shopify.auth.begin({
      shop,
      callbackPath: "/auth/callback",
      isOnline: false, // false = 离线令牌（永不过期）
      rawRequest: req,
      rawResponse: res,
    });
    // 响应已被 SDK 自动处理（302 重定向），此处不再操作 res
  } catch (err) {
    console.error("[auth] begin 失败:", err);
    if (!res.headersSent) {
      return res.status(500).send("授权初始化失败");
    }
  }
});

// -------------------------------------------------------------------
// Step 3 & 4: OAuth 回调处理
// Shopify 授权后重定向到这里，SDK 自动完成：
//   1. 验证 HMAC 签名
//   2. 验证 state (nonce)
//   3. 验证 shop 域名
//   4. 用 code 换取 access_token
//   5. 创建 session
// -------------------------------------------------------------------
router.get("/auth/callback", async (req: Request, res: Response) => {
  try {
    const shopify = getShopify();
    const { session } = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    // 持久化 session
    await memorySessionStorage.storeSession(session);

    console.log(
      `[auth] 安装成功: shop=${session.shop}, token=${session.accessToken?.slice(0, 16)}...`
    );

    // 重定向到应用首页，带上 shop 参数
    const host = req.query.host as string | undefined;
    const redirectTo = host
      ? `/?shop=${session.shop}&host=${encodeURIComponent(host)}`
      : `/?shop=${session.shop}`;

    return res.redirect(redirectTo);
  } catch (err) {
    console.error("[auth] callback 失败:", err);
    return res.status(500).send("授权处理失败");
  }
});

export default router;
