# ============================================================
# Stage 1: Build — 编译 TypeScript
# ============================================================
FROM node:22-alpine AS build

WORKDIR /app

# 先复制依赖文件，利用 Docker 层缓存
COPY package.json package-lock.json ./
RUN npm ci

# 复制源码并编译
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ============================================================
# Stage 2: Production — 最小运行镜像
# ============================================================
FROM node:22-alpine

WORKDIR /app

# 从 build 阶段复制编译产物和 production 依赖
COPY --from=build /app/dist/ ./dist/
COPY package.json package-lock.json ./

RUN npm ci --omit=dev && \
    npm cache clean --force

# 非 root 用户运行
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r=>{process.exit(r.ok?0:1)}).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]
