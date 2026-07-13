/**
 * Shopify OAuth 授权码安装 Demo
 *
 *   GET  /auth?shop=xxx    → 开始 OAuth 安装
 *   GET  /auth/callback    → 处理回调（SDK 自动验证 + 换 Token）
 *   GET  /                 → 首页（显示安装状态）
 *   GET  /health           → 健康检查
 */

import express, { type Request, type Response } from "express";
import dotenv from "dotenv";

import { getShopify } from "./shopify.js";
import { memorySessionStorage } from "./session-store.js";
import authRouter from "./routes/auth.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// -------------------------------------------------------------------
// 将 SessionStorage 注册到 Shopify SDK
// -------------------------------------------------------------------
getShopify().config.sessionStorage = memorySessionStorage;

// -------------------------------------------------------------------
// 路由
// -------------------------------------------------------------------
app.use(authRouter);

// 首页：显示安装状态
app.get("/", async (req: Request, res: Response) => {
  const shop = req.query.shop as string | undefined;

  if (!shop) {
    return res.send(HTML_HOME);
  }

  const shopify = getShopify();
  const sessionId = shopify.session.getOfflineId(shop);
  const session = await memorySessionStorage.loadSession(sessionId);

  if (session?.accessToken) {
    return res.send(
      HTML_INSTALLED.replace("{{shop}}", shop).replace(
        "{{token_preview}}",
        session.accessToken.slice(0, 16) + "..."
      ).replace("{{scopes}}", shopify.config.scopes.toString())
    );
  }

  return res.send(
    HTML_NOT_INSTALLED.replace("{{shop}}", shop)
  );
});

// 健康检查
app.get("/health", (_req: Request, res: Response) => {
  const shopify = getShopify();
  res.json({
    status: "ok",
    api_key_configured: Boolean(shopify.config.apiKey),
    api_secret_configured: Boolean(shopify.config.apiSecretKey),
    scopes: shopify.config.scopes.toString(),
  });
});

// -------------------------------------------------------------------
// 启动
// -------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Shopify App 启动: http://localhost:${PORT}`);
  console.log(`   安装链接: http://localhost:${PORT}/auth?shop=你的店铺.myshopify.com`);
});

// -------------------------------------------------------------------
// HTML 模板
// -------------------------------------------------------------------

const HTML_HOME = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shopify App</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex;
           justify-content: center; align-items: center; min-height: 100vh;
           margin: 0; background: #f6f6f7; color: #202223; }
    .card { background: white; border-radius: 8px; padding: 32px 40px;
            box-shadow: 0 1px 3px rgba(0,0,0,.12); text-align: center; }
    a { color: #008060; text-decoration: none; font-weight: 600; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Shopify App</h1>
    <p>通过 shop 参数访问：<br>
    <a href="/?shop=test.myshopify.com">/?shop=test.myshopify.com</a></p>
  </div>
</body>
</html>`;

const HTML_NOT_INSTALLED = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>安装 Shopify App</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex;
           justify-content: center; align-items: center; min-height: 100vh;
           margin: 0; background: #f6f6f7; color: #202223; }
    .card { background: white; border-radius: 8px; padding: 32px 40px;
            box-shadow: 0 1px 3px rgba(0,0,0,.12); text-align: center; }
    .shop { font-size: 18px; font-weight: 600; margin: 16px 0; }
    .btn { display: inline-block; margin-top: 20px; padding: 12px 32px;
           background: #008060; color: white; border-radius: 4px;
           text-decoration: none; font-weight: 600; }
    .btn:hover { background: #006e52; }
  </style>
</head>
<body>
  <div class="card">
    <h1>安装应用</h1>
    <div class="shop">🔒 {{shop}}</div>
    <p>授权此应用访问你的商店</p>
    <a class="btn" href="/auth?shop={{shop}}">安装应用</a>
  </div>
</body>
</html>`;

const HTML_INSTALLED = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App 已安装</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex;
           justify-content: center; align-items: center; min-height: 100vh;
           margin: 0; background: #f6f6f7; color: #202223; }
    .card { background: white; border-radius: 8px; padding: 32px 40px;
            box-shadow: 0 1px 3px rgba(0,0,0,.12); }
    .badge { display: inline-block; background: #e3f3ef; color: #006e52;
             padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; }
    .info { background: #fafafa; border: 1px solid #e1e3e5; border-radius: 6px;
            padding: 16px; margin: 16px 0; font-size: 14px; }
    dt { font-weight: 600; color: #6d7175; margin-top: 8px; }
    dd { margin-left: 0; word-break: break-all; }
    code { background: #f6f6f7; padding: 2px 6px; border-radius: 3px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>✅ 应用已安装</h1>
    <div class="badge">已授权</div>
    <dl class="info">
      <dt>商店</dt>
      <dd><code>{{shop}}</code></dd>
      <dt>Access Token</dt>
      <dd><code>{{token_preview}}</code></dd>
      <dt>权限范围</dt>
      <dd><code>{{scopes}}</code></dd>
    </dl>
  </div>
</body>
</html>`;
