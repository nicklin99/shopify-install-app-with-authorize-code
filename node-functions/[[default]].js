/**
 * EdgeOne Pages — Express 后端入口
 *
 * 文件命名规则：node-functions/express/[[default]].js
 * EdgeOne 平台会自动加载此文件，无需手动调用 app.listen()。
 *
 * 从编译后的 TypeScript 输出导入 Express app 并导出。
 * 构建时需要先运行 `npm run build` 编译 src/ → dist/。
 */

import app from "../dist/app.js";

// ⚠️ 不要调用 app.listen() — EdgeOne 平台管理 HTTP 服务
export default app;
