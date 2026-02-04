
export type UserRole = 'admin' | 'accountant' | 'clerk';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  branchId: string;
  active: boolean;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  manager: string;
}

export interface Fund {
  id: string;
  name: string;
  branchId: string;
  balance: number;
  manager: string;
  openingBalance: number;
  createdAt: string;
}

export interface Reading {
  id: string;
  subscriberId: string;
  periodYear: number;
  periodMonth: number;
  previousReading: number;
  currentReading: number;
  units: number;
  totalAmount: number;
  date: string;
  branchId: string;
  status: 'pending' | 'invoiced' | 'paid';
  isPosted: boolean;
  postedBy?: string;
  postedAt?: string;
}

export interface Invoice {
  id: string;
  readingId: string;
  subscriberId: string;
  invoiceNumber: string;
  date: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  arrears: number;
  totalDue: number;
  status: 'unpaid' | 'paid' | 'partially_paid';
  branchId: string;
  isPosted: boolean;
}

export interface Receipt {
  id: string;
  subscriberId: string;
  collectorId: string; 
  fundId: string; 
  description: string;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'transfer' | 'check';
  reference: string;
  branchId: string;
  isPosted: boolean;
}

export interface Settlement {
  id: string;
  subscriberId: string;
  type: 'credit' | 'debit' | 'meter_reset';
  amount: number;
  newReading?: number;
  description: string;
  date: string;
  reference: string;
  branchId: string;
  isPosted: boolean;
}

export interface Expense {
  id: string;
  category: string;
  fundId: string;
  description: string;
  amount: number;
  date: string;
  reference: string;
  supplierId?: string;
  branchId: string;
  isPosted: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  referenceId: string;
  referenceType: 'invoice' | 'receipt' | 'expense' | 'settlement';
  description: string;
  debit: number;
  credit: number;
  accountId: string;
  accountType: 'subscriber' | 'fund' | 'supplier' | 'income' | 'expense';
  branchId: string;
}

export interface Collector { id: string; name: string; phone: string; fundId: string; branchId: string; }
export interface PriceTier { from: number; to: number | null; price: number; }
export interface SubscriptionType { id: string; name: string; tiers: PriceTier[]; fixedFee: number; }
export interface SubscriberAttachment { id: string; subscriberId: string; name: string; fileName: string; uploadDate: string; }
export interface Subscriber { id: string; name: string; meterNumber: string; phone: string; email?: string; website?: string; address: string; country: string; governorate: string; region: string; docNumber: string; docType: string; docIssueDate: string; docIssuePlace: string; notes?: string; balance: number; initialReading: number; branchId: string; typeId: string; }
export interface Supplier { id: string; name: string; contactPerson: string; phone: string; email: string; address: string; paymentTerms: string; balance: number; branchId: string; }

// Added missing types for ReportDesigner
export type ReportModule = 'subscribers' | 'invoices' | 'receipts' | 'expenses';

export interface ReportConfig {
  title: string;
  module: ReportModule;
  columns: string[];
  filters: {
    branchId?: string;
    startDate?: string;
    endDate?: string;
  };
}

export interface Database {
  users: User[];
  branches: Branch[];
  funds: Fund[];
  collectors: Collector[];
  subscriptionTypes: SubscriptionType[];
  subscribers: Subscriber[];
  suppliers: Supplier[];
  readings: Reading[];
  invoices: Invoice[];
  receipts: Receipt[];
  settlements: Settlement[];
  expenses: Expense[];
  journal: JournalEntry[];
  attachments: SubscriberAttachment[];
  settings: {
    institutionName: string;
    currency: string;
    defaultBranchId: string;
    logo?: string;
    phone?: string;
    fax?: string;
    email?: string;
    website?: string;
    notes?: string;
    lastClosedDate?: string;
  };
}
