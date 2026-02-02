
import { dbEngine } from './database';
import { Subscriber, Reading, Invoice, Receipt, Expense, Database, SubscriptionType, User, Supplier, SubscriberAttachment, Fund, Collector } from '../types';

export const ServerAPI = {
  // منطق التحقق من الصلاحيات والقيود المحاسبية
  checkActionPermit: (entity: any, user: User, action: 'edit' | 'delete'): { allowed: boolean, reason?: string } => {
    const db = dbEngine.getRaw();
    
    // 1. التحقق من الإقفال المالي
    if (db.settings.lastClosedDate && entity.date) {
      if (new Date(entity.date) <= new Date(db.settings.lastClosedDate)) {
        return { allowed: false, reason: 'لا يمكن تعديل بيانات في فترة مالية مقفلة.' };
      }
    }

    // 2. التحقق من الترحيل
    if (entity.isPosted && user.role !== 'admin') {
      return { allowed: false, reason: 'هذا السجل مُرَحّل. التعديل متاح للمدير فقط.' };
    }

    return { allowed: true };
  },

  // ترحيل السجلات (Posting)
  postEntity: (table: keyof Database, id: string, user: User) => {
    if (user.role === 'clerk') return alert('ليس لديك صلاحية الترحيل');
    
    const items = dbEngine.query(table) as any[];
    const updated = items.map(item => {
      if (item.id === id) {
        return { ...item, isPosted: true, postedBy: user.id, postedAt: new Date().toISOString() };
      }
      return item;
    });
    dbEngine.commit(table, updated as any);
  },

  // إلغاء الترحيل (Unposting) - للمدير فقط
  unpostEntity: (table: keyof Database, id: string, user: User) => {
    if (user.role !== 'admin') return alert('إلغاء الترحيل من صلاحيات المدير فقط');
    
    const items = dbEngine.query(table) as any[];
    const updated = items.map(item => {
      if (item.id === id) {
        return { ...item, isPosted: false };
      }
      return item;
    });
    dbEngine.commit(table, updated as any);
  },

  // إقفال الفترة المالية
  closeFinancialPeriod: (date: string, user: User) => {
    if (user.role !== 'admin') return alert('الإقفال المالي من صلاحيات المدير فقط');
    const db = dbEngine.getRaw();
    db.settings.lastClosedDate = date;
    dbEngine.commit('settings', db.settings);
  },

  // التعديل مع فحص القيود
  updateEntity: <T extends keyof Database>(table: T, id: string, data: any, user: User) => {
    const items = dbEngine.query(table) as any[];
    const entity = items.find(i => i.id === id);
    if (!entity) return;

    const permit = ServerAPI.checkActionPermit(entity, user, 'edit');
    if (!permit.allowed) return alert(permit.reason);

    const updated = items.map(item => item.id === id ? { ...item, ...data } : item);
    dbEngine.commit(table, updated as any);
  },

  // الحذف مع فحص القيود
  deleteEntity: <T extends keyof Database>(table: T, id: string, user: User) => {
    const items = dbEngine.query(table) as any[];
    const entity = items.find(i => i.id === id);
    if (!entity) return;

    const permit = ServerAPI.checkActionPermit(entity, user, 'delete');
    if (!permit.allowed) return alert(permit.reason);

    const filtered = items.filter(item => item.id !== id);
    dbEngine.commit(table, filtered as any);
  },

  // الدوال الأساسية
  login: (username: string, password?: string): User | null => {
    const users = dbEngine.query('users');
    return users.find(u => u.username === username && u.password === password && u.active) || null;
  },
  getUsers: () => dbEngine.query('users'),
  addUser: (userData: Omit<User, 'id'>) => {
    const db = dbEngine.getRaw();
    const newUser: User = { ...userData, id: crypto.randomUUID() };
    dbEngine.commit('users', [...db.users, newUser]);
    return newUser;
  },
  getBranches: () => dbEngine.query('branches'),
  getFunds: (branchId?: string) => {
    const funds = dbEngine.query('funds');
    return branchId && branchId !== 'all' ? funds.filter(f => f.branchId === branchId) : funds;
  },
  getCollectors: (branchId?: string) => {
    const collectors = dbEngine.query('collectors');
    return branchId && branchId !== 'all' ? collectors.filter(c => c.branchId === branchId) : collectors;
  },
  addCollector: (collectorData: Omit<Collector, 'id'>) => {
    const db = dbEngine.getRaw();
    const newCollector: Collector = { ...collectorData, id: crypto.randomUUID() };
    dbEngine.commit('collectors', [...db.collectors, newCollector]);
    return newCollector;
  },
  getSubscriptionTypes: () => dbEngine.query('subscriptionTypes'),
  calculateTieredCost: (units: number, type: SubscriptionType): number => {
    let cost = 0; let remainingUnits = units; cost += type.fixedFee;
    for (const tier of type.tiers) {
      const tierMax = tier.to !== null ? tier.to : Infinity;
      const tierSize = tierMax - tier.from + 1;
      const unitsInThisTier = Math.min(remainingUnits, tierSize);
      if (unitsInThisTier <= 0) break;
      cost += unitsInThisTier * tier.price;
      remainingUnits -= unitsInThisTier;
    }
    return cost;
  },
  addReading: (readingData: Omit<Reading, 'id' | 'status' | 'isPosted'>): { success: boolean, message?: string, data?: any } => {
    const db = dbEngine.getRaw();
    
    // منع تكرار الفواتير: فحص هل توجد قراءة لنفس المشترك في نفس الشهر والسنة
    const duplicate = db.readings.find(r => 
      r.subscriberId === readingData.subscriberId && 
      r.periodMonth === readingData.periodMonth && 
      r.periodYear === readingData.periodYear
    );

    if (duplicate) {
      return { 
        success: false, 
        message: `خطأ محاسبي: المشترك لديه قراءة/فاتورة مسجلة بالفعل لشهر ${readingData.periodMonth} سنة ${readingData.periodYear}. لا يسمح النظام بإصدار أكثر من فاتورة لنفس الفترة المالية.` 
      };
    }

    const readingId = crypto.randomUUID();
    const sub = db.subscribers.find(s => s.id === readingData.subscriberId);
    const arrears = sub?.balance || 0;
    const newReading: Reading = { ...readingData, id: readingId, status: 'invoiced', isPosted: false };
    const newInvoice: Invoice = {
      id: crypto.randomUUID(), readingId, subscriberId: readingData.subscriberId,
      invoiceNumber: `INV-${Date.now()}`, date: readingData.date,
      dueDate: new Date(Date.now() + 15*24*60*60*1000).toISOString().split('T')[0],
      amount: readingData.totalAmount, arrears, totalDue: readingData.totalAmount + arrears,
      status: 'unpaid', branchId: readingData.branchId, isPosted: false
    };
    dbEngine.commit('readings', [...db.readings, newReading]);
    dbEngine.commit('invoices', [...db.invoices, newInvoice]);
    dbEngine.commit('subscribers', db.subscribers.map(s => s.id === readingData.subscriberId ? { ...s, balance: s.balance + readingData.totalAmount } : s));
    
    return { success: true, data: { reading: newReading, invoice: newInvoice } };
  },
  getSubscribers: (branchId?: string) => dbEngine.query('subscribers'),
  getSubscriberById: (id: string) => dbEngine.query('subscribers').find(s => s.id === id),
  addSubscriber: (subscriberData: Omit<Subscriber, 'id' | 'balance'>) => {
    const db = dbEngine.getRaw();
    const newSubscriber: Subscriber = { ...subscriberData, id: crypto.randomUUID(), balance: 0 };
    dbEngine.commit('subscribers', [...db.subscribers, newSubscriber]);
    return newSubscriber;
  },
  mergeSubscribers: (data: any[]) => {
    const db = dbEngine.getRaw();
    let added = 0;
    data.forEach(item => {
      if (!db.subscribers.find(s => s.meterNumber === item.meterNumber)) {
        db.subscribers.push({
          ...item,
          id: item.id || crypto.randomUUID(),
          balance: Number(item.balance) || 0,
          initialReading: Number(item.initialReading) || 0
        });
        added++;
      }
    });
    dbEngine.commit('subscribers', db.subscribers);
    return { added };
  },
  getSubscriberAttachments: (subscriberId: string) => {
    return dbEngine.query('attachments').filter(a => a.subscriberId === subscriberId);
  },
  addAttachment: (attachmentData: Omit<SubscriberAttachment, 'id' | 'uploadDate'>) => {
    const db = dbEngine.getRaw();
    const newAttachment: SubscriberAttachment = { ...attachmentData, id: crypto.randomUUID(), uploadDate: new Date().toISOString() };
    dbEngine.commit('attachments', [...db.attachments, newAttachment]);
    return newAttachment;
  },
  deleteAttachment: (id: string) => {
    const attachments = dbEngine.query('attachments');
    dbEngine.commit('attachments', attachments.filter(a => a.id !== id));
  },
  getSuppliers: (branchId?: string) => {
    const suppliers = dbEngine.query('suppliers');
    return branchId && branchId !== 'all' ? suppliers.filter(s => s.branchId === branchId) : suppliers;
  },
  addSupplier: (supplierData: Omit<Supplier, 'id' | 'balance'>) => {
    const db = dbEngine.getRaw();
    const newSupplier: Supplier = { ...supplierData, id: crypto.randomUUID(), balance: 0 };
    dbEngine.commit('suppliers', [...db.suppliers, newSupplier]);
    return newSupplier;
  },
  addReceipt: (receiptData: Omit<Receipt, 'id' | 'isPosted'>) => {
    const db = dbEngine.getRaw();
    const newReceipt: Receipt = { ...receiptData, id: crypto.randomUUID(), isPosted: false };
    dbEngine.commit('receipts', [...db.receipts, newReceipt]);
    dbEngine.commit('subscribers', db.subscribers.map(s => s.id === receiptData.subscriberId ? { ...s, balance: Math.max(0, s.balance - receiptData.amount) } : s));
    dbEngine.commit('funds', db.funds.map(f => f.id === receiptData.fundId ? { ...f, balance: f.balance + receiptData.amount } : f));
    return newReceipt;
  },
  addExpense: (expenseData: Omit<Expense, 'id' | 'isPosted'>) => {
    const db = dbEngine.getRaw();
    const newExpense: Expense = { ...expenseData, id: crypto.randomUUID(), isPosted: false };
    dbEngine.commit('expenses', [...db.expenses, newExpense]);
    dbEngine.commit('funds', db.funds.map(f => f.id === expenseData.fundId ? { ...f, balance: f.balance - expenseData.amount } : f));
    return newExpense;
  },
  getSubscriberStatement: (subscriberId: string) => {
    const invoices = dbEngine.query('invoices').filter(i => i.subscriberId === subscriberId);
    const receipts = dbEngine.query('receipts').filter(r => r.subscriberId === subscriberId);
    return [...invoices.map(i => ({ date: i.date, description: `فاتورة #${i.invoiceNumber}`, debit: i.amount, credit: 0 })),
            ...receipts.map(r => ({ date: r.date, description: `سند قبض - ${r.paymentMethod}`, debit: 0, credit: r.amount }))]
            .sort((a, b) => a.date.localeCompare(b.date));
  }
};
