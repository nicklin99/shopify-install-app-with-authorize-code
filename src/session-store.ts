/**
 * 内存 Session 存储（开发/演示用）
 *
 * 生产环境请替换为数据库实现（如 SQLite, PostgreSQL, Redis 等）。
 *
 * 需要实现 @shopify/shopify-api 的 SessionStorage 接口：
 *   - storeSession(session): 保存 session
 *   - loadSession(id):       读取 session
 *   - deleteSession(id):     删除 session
 *   - deleteSessions(ids):   批量删除
 *   - findSessionsByShop(shop): 按 shop 查找
 */

import type {
  SessionInterface,
  SessionStorage,
} from "@shopify/shopify-api";

const sessions = new Map<string, SessionInterface>();

export const memorySessionStorage: SessionStorage = {
  async storeSession(session: SessionInterface): Promise<boolean> {
    sessions.set(session.id, session);
    return true;
  },

  async loadSession(id: string): Promise<SessionInterface | undefined> {
    return sessions.get(id);
  },

  async deleteSession(id: string): Promise<boolean> {
    return sessions.delete(id);
  },

  async deleteSessions(ids: string[]): Promise<boolean> {
    ids.forEach((id) => sessions.delete(id));
    return true;
  },

  async findSessionsByShop(shop: string): Promise<SessionInterface[]> {
    return Array.from(sessions.values()).filter((s) => s.shop === shop);
  },
};
