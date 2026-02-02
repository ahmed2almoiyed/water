
import { Database } from '../types';

const STORAGE_KEY = 'water_system_sqlite_sim_v1';

export class DatabaseEngine {
  private static instance: DatabaseEngine;
  private data: Database;

  private constructor() {
    this.data = this.load();
  }

  public static getInstance(): DatabaseEngine {
    if (!DatabaseEngine.instance) {
      DatabaseEngine.instance = new DatabaseEngine();
    }
    return DatabaseEngine.instance;
  }

  private load(): Database {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // التحقق من توافق الحقول الجديدة للصناديق
        if (parsed.funds) {
          parsed.funds = parsed.funds.map((f: any) => ({
            ...f,
            manager: f.manager || 'غير محدد',
            openingBalance: f.openingBalance || 0,
            createdAt: f.createdAt || new Date().toISOString()
          }));
        }
        if (!parsed.branches) parsed.branches = [];
        if (!parsed.users) parsed.users = [];
        if (!parsed.funds) parsed.funds = [];
        if (!parsed.collectors) parsed.collectors = [];
        if (!parsed.subscriptionTypes) parsed.subscriptionTypes = [];
        if (!parsed.attachments) parsed.attachments = [];
        if (!parsed.settings.phone) parsed.settings.phone = "";
        if (!parsed.settings.fax) parsed.settings.fax = "";
        if (!parsed.settings.email) parsed.settings.email = "";
        if (!parsed.settings.website) parsed.settings.website = "";
        if (!parsed.settings.notes) parsed.settings.notes = "";
        return parsed;
      } catch (e) {
        console.error("Database corruption detected, resetting...", e);
      }
    }
    return this.getInitialSchema();
  }

  private getInitialSchema(): Database {
    const mainBranchId = 'br-1';
    const mainFundId = 'f-1';
    const now = new Date().toISOString();
    return {
      users: [
        { id: 'u1', username: 'admin', password: 'admin', name: 'المدير العام', role: 'admin', branchId: mainBranchId, active: true }
      ],
      branches: [
        { id: 'br-1', name: 'الفرع الرئيسي', location: 'وسط المدينة', manager: 'أحمد علي' },
        { id: 'br-2', name: 'فرع الشمال', location: 'حي النرجس', manager: 'سالم فهد' }
      ],
      funds: [
        { id: mainFundId, name: 'الصندوق الرئيسي', branchId: mainBranchId, balance: 0, manager: 'أحمد علي', openingBalance: 0, createdAt: now },
        { id: 'f-2', name: 'خزينة فرع الشمال', branchId: 'br-2', balance: 0, manager: 'سالم فهد', openingBalance: 0, createdAt: now }
      ],
      collectors: [
        { id: 'c-1', name: 'محمد المحصل', phone: '777111222', fundId: mainFundId, branchId: mainBranchId }
      ],
      subscriptionTypes: [
        { 
          id: 'st-1', 
          name: 'سكني', 
          fixedFee: 15, 
          tiers: [
            { from: 0, to: 10, price: 1.5 },
            { from: 11, to: 30, price: 2.5 },
            { from: 31, to: null, price: 5.0 }
          ] 
        },
        { 
          id: 'st-2', 
          name: 'تجاري', 
          fixedFee: 50, 
          tiers: [
            { from: 0, to: null, price: 6.0 }
          ] 
        }
      ],
      subscribers: [
        { 
          id: '1', 
          name: 'أحمد محمد علي', 
          meterNumber: 'M-1001', 
          phone: '0501234567', 
          email: 'ahmed@example.com',
          website: '',
          address: 'الحي الرئيسي، شارع 1', 
          country: 'اليمن',
          governorate: 'صنعاء',
          region: 'السبعين',
          docNumber: '01010101',
          docType: 'بطاقة شخصية',
          docIssueDate: '2020-01-01',
          docIssuePlace: 'صنعاء',
          notes: 'مشترك قديم',
          balance: 0, 
          initialReading: 120, 
          branchId: mainBranchId, 
          typeId: 'st-1' 
        }
      ],
      suppliers: [],
      readings: [],
      invoices: [],
      receipts: [],
      expenses: [],
      attachments: [],
      settings: {
        institutionName: 'مؤسسة المياه الوطنية',
        currency: 'ريال',
        defaultBranchId: 'br-1',
        phone: '',
        fax: '',
        email: '',
        website: '',
        notes: ''
      }
    };
  }

  public query<K extends keyof Database>(table: K): Database[K] {
    return this.data[table];
  }

  public commit<K extends keyof Database>(table: K, newData: Database[K]) {
    this.data[table] = newData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  public getRaw(): Database {
    return this.data;
  }

  public overwrite(db: Database) {
    this.data = db;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
}

export const dbEngine = DatabaseEngine.getInstance();
