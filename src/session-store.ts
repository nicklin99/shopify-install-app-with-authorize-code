/**
 * 内存 Session 存储（开发/演示用）
 *
 * @shopify/shopify-api v11 移除了 SessionStorage 接口，
 * Session 管理由开发者自行实现。此处提供兼容的 Map 存储。
 *
 * 生产环境请替换为数据库实现（如 SQLite, PostgreSQL, Redis 等）。
 */

import { Session } from "@shopify/shopify-api";

const sessions = new Map<string, Session>();

// 类型：定义统一的 Session 存储接口
type StoreSession = (session: Session) => Promise<boolean>;
type LoadSession = (id: string) => Promise<Session | undefined>;
type DeleteSession = (id: string) => Promise<boolean>;
type DeleteSessions = (ids: string[]) => Promise<boolean>;
type FindSessionsByShop = (shop: string) => Promise<Session[]>;

export interface SessionStore {
  storeSession: StoreSession;
  loadSession: LoadSession;
  deleteSession: DeleteSession;
  deleteSessions: DeleteSessions;
  findSessionsByShop: FindSessionsByShop;
}

export const memorySessionStorage: SessionStore = {
  async storeSession(session: Session): Promise<boolean> {
    sessions.set(session.id, session);
    return true;
  },

  async loadSession(id: string): Promise<Session | undefined> {
    return sessions.get(id);
  },

  async deleteSession(id: string): Promise<boolean> {
    return sessions.delete(id);
  },

  async deleteSessions(ids: string[]): Promise<boolean> {
    ids.forEach((id) => sessions.delete(id));
    return true;
  },

  async findSessionsByShop(shop: string): Promise<Session[]> {
    return Array.from(sessions.values()).filter((s) => s.shop === shop);
  },
};
