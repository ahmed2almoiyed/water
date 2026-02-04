
import { Database, Subscriber, Reading, Invoice, Receipt, Expense } from '../types';

const DB_KEY = 'water_system_db_v1';

// Fix: added missing 'funds', 'collectors', 'attachments', 'settlements', and 'journal' properties to comply with Database interface
const initialDb: Database = {
  users: [
    { id: 'u1', username: 'admin', name: 'المدير العام', role: 'admin', branchId: 'br-1', active: true }
  ],
  branches: [
    { id: 'br-1', name: 'الفرع الرئيسي', location: 'وسط المدينة', manager: 'أحمد علي' }
  ],
  funds: [
    // Added missing required properties (manager, openingBalance, createdAt) to fix property mismatch error
    { id: 'f-1', name: 'الصندوق الرئيسي', branchId: 'br-1', balance: 0, manager: 'أحمد علي', openingBalance: 0, createdAt: new Date().toISOString() }
  ],
  collectors: [
    { id: 'c-1', name: 'محمد المحصل', phone: '777111222', fundId: 'f-1', branchId: 'br-1' }
  ],
  subscriptionTypes: [
    { 
      id: 'st-1', 
      name: 'سكني', 
      fixedFee: 15, 
      tiers: [{ from: 0, to: null, price: 2.5 }] 
    }
  ],
  subscribers: [
    // Added missing required properties for Ahmed to fix property mismatch error
    { 
      id: '1', 
      name: 'أحمد محمد علي', 
      meterNumber: 'M-1001', 
      phone: '0501234567', 
      address: 'الحي الرئيسي، شارع 1', 
      country: 'اليمن',
      governorate: 'صنعاء',
      region: 'السبعين',
      docNumber: '01010101',
      docType: 'بطاقة شخصية',
      docIssueDate: '2020-01-01',
      docIssuePlace: 'صنعاء',
      balance: 0, 
      initialReading: 120, 
      branchId: 'br-1', 
      typeId: 'st-1' 
    },
    // Added missing required properties for Sara to fix property mismatch error
    { 
      id: '2', 
      name: 'سارة خالد محمود', 
      meterNumber: 'M-1002', 
      phone: '0507654321', 
      address: 'حي الزهور، فيلا 5', 
      country: 'اليمن',
      governorate: 'صنعاء',
      region: 'الوحدة',
      docNumber: '02020202',
      docType: 'بطاقة شخصية',
      docIssueDate: '2021-05-15',
      docIssuePlace: 'صنعاء',
      balance: 0, 
      initialReading: 85, 
      branchId: 'br-1', 
      typeId: 'st-1' 
    },
  ],
  suppliers: [
    { id: 's1', name: 'شركة توريد المحابس الذهبية', contactPerson: 'المهندس فهد', phone: '055112233', email: 'info@valves.com', address: 'المنطقة الصناعية', paymentTerms: 'دفع نقدي', balance: 0, branchId: 'br-1' },
    { id: 's2', name: 'شركة الوطنية لتوريد الأنابيب', contactPerson: 'المهندس خالد', phone: '0509876543', email: 'sales@nationalpipes.com', address: 'المنطقة الصناعية الجديدة', paymentTerms: 'آجل 30 يوم', balance: 0, branchId: 'br-1' }
  ],
  readings: [],
  invoices: [],
  receipts: [],
  // Fix: added missing 'settlements' property to comply with Database interface
  settlements: [],
  expenses: [],
  // Fix: added missing 'journal' property to comply with Database interface
  journal: [],
  // Fix: added missing 'attachments' property to comply with Database interface
  attachments: [],
  settings: {
    institutionName: 'مؤسسة المياه الوطنية - الفرع الرئيسي',
    currency: 'ريال',
    defaultBranchId: 'br-1'
  }
};

export const dbService = {
  getDb: (): Database => {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
      localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
      return initialDb;
    }
    return JSON.parse(data);
  },

  saveDb: (db: Database) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  },

  // Subscribers
  getSubscribers: () => dbService.getDb().subscribers,
  addSubscriber: (sub: Omit<Subscriber, 'id' | 'balance'>) => {
    const db = dbService.getDb();
    const newSub: Subscriber = { ...sub, id: crypto.randomUUID(), balance: 0 };
    db.subscribers.push(newSub);
    dbService.saveDb(db);
    return newSub;
  },

  // Readings
  addReading: (reading: Omit<Reading, 'id' | 'status'>) => {
    const db = dbService.getDb();
    // Fix: added missing isPosted property
    const newReading: Reading = { 
      ...reading, 
      id: crypto.randomUUID(), 
      status: 'invoiced',
      isPosted: false
    };
    db.readings.push(newReading);

    // Update subscriber balance
    const sub = db.subscribers.find(s => s.id === reading.subscriberId);
    const arrears = sub?.balance || 0;
    if (sub) sub.balance += reading.totalAmount;

    // Fix: Create Invoice automatically with required properties, including isPosted and missing issueDate
    const newInvoice: Invoice = {
      id: crypto.randomUUID(),
      readingId: newReading.id,
      subscriberId: reading.subscriberId,
      invoiceNumber: `INV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: reading.totalAmount,
      arrears: arrears,
      totalDue: reading.totalAmount + arrears,
      status: 'unpaid',
      branchId: reading.branchId,
      isPosted: false
    };
    db.invoices.push(newInvoice);
    
    dbService.saveDb(db);
    return { reading: newReading, invoice: newInvoice };
  },

  // Receipts
  addReceipt: (receipt: Omit<Receipt, 'id'>) => {
    const db = dbService.getDb();
    const newReceipt: Receipt = { ...receipt, id: crypto.randomUUID() };
    db.receipts.push(newReceipt);
    
    const sub = db.subscribers.find(s => s.id === receipt.subscriberId);
    if (sub) sub.balance -= receipt.amount;

    dbService.saveDb(db);
    return newReceipt;
  },

  // Expenses
  addExpense: (expense: Omit<Expense, 'id'>) => {
    const db = dbService.getDb();
    const newExpense: Expense = { ...expense, id: crypto.randomUUID() };
    db.expenses.push(newExpense);
    dbService.saveDb(db);
    return newExpense;
  },

  getSettings: () => dbService.getDb().settings,
  updateSettings: (settings: Database['settings']) => {
    const db = dbService.getDb();
    db.settings = settings;
    dbService.saveDb(db);
  }
};
