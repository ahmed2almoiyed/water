
import { dbEngine } from './database';
import { Subscriber, Reading, Invoice, Receipt, Expense, Database, SubscriptionType, User, Supplier, Fund, Collector, Settlement, JournalEntry } from '../types';

export const ServerAPI = {
  // إنشاء قيد محاسبي
  addJournalEntry: async (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = { ...entry, id: crypto.randomUUID() };
    return await dbEngine.saveItem('journal', newEntry);
  },

  postEntity: async (table: keyof Database, id: string, user: User) => {
    const items = await dbEngine.query(table) as any[];
    const item = items.find(i => i.id === id);
    if (item) {
      const updated = { ...item, isPosted: true, postedBy: user.id, postedAt: new Date().toISOString() };
      await dbEngine.saveItem(table, updated);
    }
  },

  unpostEntity: async (table: keyof Database, id: string, user: User) => {
    if (user.role !== 'admin') return alert('إلغاء الترحيل متاح للمدير فقط');
    const items = await dbEngine.query(table) as any[];
    const item = items.find(i => i.id === id);
    if (item) {
      const updated = { ...item, isPosted: false };
      await dbEngine.saveItem(table, updated);
    }
  },

  login: async (username: string, password?: string): Promise<User | null> => {
    const users = await dbEngine.query('users');
    return users.find(u => u.username === username && u.password === password && u.active) || null;
  },

  getSubscribers: async (branchId?: string) => {
    const subs = await dbEngine.query('subscribers');
    return branchId && branchId !== 'all' ? subs.filter(s => s.branchId === branchId) : subs;
  },

  mergeSubscribers: async (data: any[]) => {
    let added = 0;
    const existingSubs = await dbEngine.query('subscribers');
    for (const item of data) {
      if (!existingSubs.find(s => s.meterNumber === item.meterNumber)) {
        await ServerAPI.addSubscriber({
          ...item,
          initialReading: Number(item.initialReading) || 0,
          branchId: item.branchId || 'br-main',
          typeId: item.typeId || 'st-1'
        });
        added++;
      }
    }
    return { added };
  },

  getSubscriberById: async (id: string) => {
    const subs = await dbEngine.query('subscribers');
    return subs.find(s => s.id === id);
  },

  getSubscriberStatement: async (subscriberId: string) => {
    const journal = (await dbEngine.query('journal')).filter(j => j.accountId === subscriberId);
    return journal.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  addReading: async (readingData: Omit<Reading, 'id' | 'status' | 'isPosted'>): Promise<{ success: boolean; message?: string }> => {
    const readingId = crypto.randomUUID();
    const subs = await dbEngine.query('subscribers');
    const sub = subs.find(s => s.id === readingData.subscriberId);
    const arrears = sub?.balance || 0;
    
    const newReading: Reading = { ...readingData, id: readingId, status: 'invoiced', isPosted: false };
    const invoiceId = crypto.randomUUID();
    const invoiceNumber = `INV-${Date.now()}`;
    
    const newInvoice: Invoice = {
      id: invoiceId,
      readingId,
      subscriberId: readingData.subscriberId,
      invoiceNumber,
      date: readingData.date,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15*24*60*60*1000).toISOString().split('T')[0],
      amount: readingData.totalAmount,
      arrears,
      totalDue: readingData.totalAmount + arrears,
      status: 'unpaid',
      branchId: readingData.branchId,
      isPosted: false
    };

    await dbEngine.saveItem('readings', newReading);
    await dbEngine.saveItem('invoices', newInvoice);
    
    if (sub) {
      await dbEngine.saveItem('subscribers', { ...sub, balance: sub.balance + readingData.totalAmount });
      // إنشاء قيد محاسبي: مدين (حساب المشترك) دائن (إيرادات مياه)
      await ServerAPI.addJournalEntry({
        date: readingData.date,
        referenceId: invoiceId,
        referenceType: 'invoice',
        description: `فاتورة استهلاك مياه رقم ${invoiceNumber} - المشترك ${sub.name}`,
        debit: readingData.totalAmount,
        credit: 0,
        accountId: sub.id,
        accountType: 'subscriber',
        branchId: readingData.branchId
      });
    }
    return { success: true };
  },

  addReceipt: async (receiptData: Omit<Receipt, 'id' | 'isPosted'>) => {
    const receiptId = crypto.randomUUID();
    const newReceipt: Receipt = { ...receiptData, id: receiptId, isPosted: false };
    await dbEngine.saveItem('receipts', newReceipt);

    const sub = (await dbEngine.query('subscribers')).find(s => s.id === receiptData.subscriberId);
    if (sub) {
      await dbEngine.saveItem('subscribers', { ...sub, balance: Math.max(0, sub.balance - receiptData.amount) });
    }

    const fund = (await dbEngine.query('funds')).find(f => f.id === receiptData.fundId);
    if (fund) {
      await dbEngine.saveItem('funds', { ...fund, balance: fund.balance + receiptData.amount });
    }

    // قيود مزدوجة للسند
    // 1. حساب المشترك (دائن)
    await ServerAPI.addJournalEntry({
      date: receiptData.date,
      referenceId: receiptId,
      referenceType: 'receipt',
      description: `سداد فاتورة - سند قبض ${receiptData.reference}`,
      debit: 0,
      credit: receiptData.amount,
      accountId: receiptData.subscriberId,
      accountType: 'subscriber',
      branchId: receiptData.branchId
    });

    // 2. حساب الصندوق (مدين)
    await ServerAPI.addJournalEntry({
      date: receiptData.date,
      referenceId: receiptId,
      referenceType: 'receipt',
      description: `تحصيل نقدي - سند ${receiptData.reference}`,
      debit: receiptData.amount,
      credit: 0,
      accountId: receiptData.fundId,
      accountType: 'fund',
      branchId: receiptData.branchId
    });

    return newReceipt;
  },

  addExpense: async (expenseData: Omit<Expense, 'id' | 'isPosted'>) => {
    const expenseId = crypto.randomUUID();
    const newExpense: Expense = { ...expenseData, id: expenseId, isPosted: false };
    await dbEngine.saveItem('expenses', newExpense);

    const fund = (await dbEngine.query('funds')).find(f => f.id === expenseData.fundId);
    if (fund) {
      await dbEngine.saveItem('funds', { ...fund, balance: fund.balance - expenseData.amount });
    }

    // قيد المصروف: مدين (مصروفات) دائن (الصندوق)
    await ServerAPI.addJournalEntry({
      date: expenseData.date,
      referenceId: expenseId,
      referenceType: 'expense',
      description: `صرف: ${expenseData.description}`,
      debit: 0,
      credit: expenseData.amount,
      accountId: expenseData.fundId,
      accountType: 'fund',
      branchId: expenseData.branchId
    });

    return newExpense;
  },

  addSettlement: async (data: Omit<Settlement, 'id' | 'isPosted'>) => {
    const settleId = crypto.randomUUID();
    const newSettlement: Settlement = { ...data, id: settleId, isPosted: false };
    await dbEngine.saveItem('settlements', newSettlement);

    const subs = await dbEngine.query('subscribers');
    const sub = subs.find(s => s.id === data.subscriberId);
    if (sub) {
      let newBalance = sub.balance;
      if (data.type === 'credit') newBalance -= data.amount;
      else if (data.type === 'debit') newBalance += data.amount;
      await dbEngine.saveItem('subscribers', { ...sub, balance: newBalance });

      // قيد التسوية
      await ServerAPI.addJournalEntry({
        date: data.date,
        referenceId: settleId,
        referenceType: 'settlement',
        description: `تسوية حساب: ${data.description}`,
        debit: data.type === 'debit' ? data.amount : 0,
        credit: data.type === 'credit' ? data.amount : 0,
        accountId: data.subscriberId,
        accountType: 'subscriber',
        branchId: data.branchId
      });
    }
    return newSettlement;
  },

  addSubscriber: async (data: Omit<Subscriber, 'id' | 'balance'>) => {
    const newSub: Subscriber = { ...data, id: crypto.randomUUID(), balance: 0 };
    return await dbEngine.saveItem('subscribers', newSub);
  },

  addFund: async (data: Omit<Fund, 'id' | 'balance'>) => {
    const newFund: Fund = { ...data, id: crypto.randomUUID(), balance: data.openingBalance };
    return await dbEngine.saveItem('funds', newFund);
  },

  addSupplier: async (data: Omit<Supplier, 'id' | 'balance'>) => {
    const newSup: Supplier = { ...data, id: crypto.randomUUID(), balance: 0 };
    return await dbEngine.saveItem('suppliers', newSup);
  },

  addCollector: async (data: Omit<Collector, 'id'>) => {
    const newColl: Collector = { ...data, id: crypto.randomUUID() };
    return await dbEngine.saveItem('collectors', newColl);
  },

  addUser: async (data: Omit<User, 'id'>) => {
    const newUser: User = { ...data, id: crypto.randomUUID() };
    return await dbEngine.saveItem('users', newUser);
  },

  addSubscriptionType: async (data: Omit<SubscriptionType, 'id'>) => {
    const newType: SubscriptionType = { ...data, id: crypto.randomUUID() };
    return await dbEngine.saveItem('subscriptionTypes', newType);
  },

  getBranches: async () => await dbEngine.query('branches'),
  getSubscriptionTypes: async () => await dbEngine.query('subscriptionTypes'),
  getSuppliers: async (branchId?: string) => {
    const sups = await dbEngine.query('suppliers');
    return branchId && branchId !== 'all' ? sups.filter(s => s.branchId === branchId) : sups;
  },

  closeFinancialPeriod: async (date: string, user: User) => {
    if (user.role !== 'admin') return;
    const db = dbEngine.getRaw();
    const updatedSettings = { ...db.settings, lastClosedDate: date };
    await dbEngine.overwrite({ ...db, settings: updatedSettings });
  },

  updateEntity: async (table: keyof Database, id: string, data: any, user: User) => {
    const items = await dbEngine.query(table) as any[];
    const entity = items.find(i => i.id === id);
    if (entity) {
      const updated = { ...entity, ...data };
      await dbEngine.saveItem(table, updated);
    }
  },

  deleteEntity: async (table: keyof Database, id: string, user: User) => {
    await dbEngine.deleteItem(table, id);
  },

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
  }
};
