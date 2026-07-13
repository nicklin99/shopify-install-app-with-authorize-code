# Shopify App — 授权码安装 (Authorization Code Grant)

使用 **TypeScript** + **Express** + **[@shopify/shopify-api](https://github.com/Shopify/shopify-app-js/tree/main/packages/apps/shopify-api)** 实现。

OAuth 全流程（HMAC 验证、nonce 校验、code 换 token、session 管理）全部由 Shopify 官方 SDK 处理，只需几行代码。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写：

```ini
SHOPIFY_API_KEY=你的_api_key
SHOPIFY_API_SECRET=你的_api_secret
SASS_APP_URL=https://你的域名.ngrok.io
SHOPIFY_SCOPES=write_products,read_customers
```

### 3. 配置 Shopify 后台

1. [Shopify Partners](https://partners.shopify.com) → Apps → 选择你的应用
2. **App URL** 填写 `SASS_APP_URL`
3. **Allowed redirection URL(s)** 添加 `{SASS_APP_URL}/auth/callback`

### 4. 启动

```bash
npm run dev       # 开发模式（tsx watch）
# 或
npm run build && npm start   # 生产模式
```

### 5. 安装到店铺

```
{你的域名}/auth?shop=你的店铺.myshopify.com
```

> 本地开发需要用 [ngrok](https://ngrok.com/) 暴露公网 HTTPS 地址。

## 项目结构

```
shopify-install-app-with-authorize-code/
├── src/
│   ├── index.ts          # Express 入口 + 首页/健康检查路由
│   ├── shopify.ts        # @shopify/shopify-api SDK 初始化
│   ├── session-store.ts  # 内存 Session 存储（实现 SessionStorage 接口）
│   └── routes/
│       └── auth.ts       # OAuth 路由（/auth, /auth/callback）
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 路由说明

| 路由 | 功能 |
|------|------|
| `GET /auth?shop=xxx` | 开始 OAuth 授权，SDK 自动生成 nonce 并重定向到 Shopify |
| `GET /auth/callback` | 处理回调，SDK 自动验证 HMAC/nonce/shop 并换取 Token |
| `GET /` | 首页，显示安装状态 |
| `GET /health` | 健康检查 |

## SDK 做了什么（对比手写）

| 功能 | Python 手写 (~120行) | TypeScript SDK (0行) |
|------|-------------------|-------------------|
| HMAC-SHA256 验签 | 自己实现 | 内置 |
| nonce 生成/校验 | 自己实现 | 内置 |
| shop 域名校验 | 正则手写 | 内置 |
| Token 交换 POST 请求 | httpx 手写 | 内置 |
| Session 管理 | 自己写接口 | 实现一个接口即可 |

## 生产部署

- **Session 存储**：`src/session-store.ts` 目前是内存实现，生产环境请替换为 Redis/数据库
- **HTTPS**：必须使用 HTTPS（Shopify 要求）
