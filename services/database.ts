
import { Database } from '../types';

// استخدام IP مباشر يقلل من احتمالية فشل الاتصال في بعض بيئات التطوير
const API_BASE_URL = 'http://127.0.0.1:3001/api';

const initialDb: Database = {
  users: [],
  branches: [],
  funds: [],
  collectors: [],
  subscriptionTypes: [],
  subscribers: [],
  suppliers: [],
  readings: [],
  invoices: [],
  receipts: [],
  settlements: [],
  expenses: [],
  journal: [],
  attachments: [],
  settings: {
    institutionName: 'مؤسسة المياه الوطنية',
    currency: 'ريال',
    defaultBranchId: 'br-main'
  }
};

type Listener = (db: Database) => void;

export class DatabaseEngine {
  private static instance: DatabaseEngine;
  private cache: Database = initialDb;
  private listeners: Set<Listener> = new Set();
  
  private constructor() {}

  public static getInstance(): DatabaseEngine {
    if (!DatabaseEngine.instance) {
      DatabaseEngine.instance = new DatabaseEngine();
    }
    return DatabaseEngine.instance;
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private notify() {
    this.listeners.forEach(l => l({ ...this.cache }));
  }

  public async checkServerStatus(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1500); // مهلة قصيرة للتحقق السريع
      const res = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, { 
        signal: controller.signal,
        cache: 'no-store'
      });
      clearTimeout(id);
      return res.ok;
    } catch {
      return false;
    }
  }

  // وظيفة مخصصة لزر "تشغيل/تحقق" اليدوي
  public async pingServer(): Promise<boolean> {
    return await this.checkServerStatus();
  }

  public getRaw(): Database {
    return this.cache;
  }

  private async fetchApi(endpoint: string, options?: RequestInit) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `API Error: ${response.statusText}`);
      }
      const data = await response.json();
      
      if (endpoint === '/app/settings') {
        this.cache.settings = data;
      } else if (endpoint.startsWith('/') && !endpoint.includes('app/settings')) {
        const table = endpoint.split('/')[1] as keyof Database;
        if (this.cache[table] !== undefined && Array.isArray(data)) {
          (this.cache as any)[table] = data;
        }
      }
      this.notify();
      return data;
    } catch (e) {
      console.error("❌ Database Engine Error:", e);
      throw e;
    }
  }

  public async query<K extends keyof Database>(table: K): Promise<Database[K]> {
    if (table === 'settings') return await this.fetchApi('/app/settings');
    return await this.fetchApi(`/${table}`);
  }

  public async saveItem(table: keyof Database, item: any) {
    if (!item.id) item.id = crypto.randomUUID();
    const res = await this.fetchApi(`/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    await this.query(table);
    return res;
  }

  public async deleteItem(table: keyof Database, id: string) {
    const res = await this.fetchApi(`/${table}/${id}`, {
      method: 'DELETE'
    });
    await this.query(table);
    return res;
  }

  public async overwrite(db: Database) {
    this.cache = db;
    const res = await this.fetchApi('/app/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db.settings)
    });
    this.notify();
    return res;
  }
}

export const dbEngine = DatabaseEngine.getInstance();
