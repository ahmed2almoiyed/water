
import { Database } from '../types';

export type FieldType = 'string' | 'number' | 'date' | 'boolean' | 'currency' | 'relation';

export interface ColumnMetadata {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  isSummary?: boolean; // يظهر في ملخص التقارير
  relationTable?: keyof Database;
}

export interface TableMetadata {
  key: keyof Database;
  label: string;
  description: string;
  columns: ColumnMetadata[];
}

export const dbSchema: Record<string, TableMetadata> = {
  subscribers: {
    key: 'subscribers',
    label: 'المشتركين',
    description: 'قاعدة بيانات المشتركين والعدادات',
    columns: [
      { key: 'name', label: 'اسم المشترك', type: 'string', required: true, isSummary: true },
      { key: 'meterNumber', label: 'رقم العداد', type: 'string', required: true, isSummary: true },
      { key: 'phone', label: 'رقم الهاتف', type: 'string', required: true },
      { key: 'balance', label: 'الرصيد الحالي', type: 'currency', required: true, isSummary: true },
      { key: 'initialReading', label: 'القراءة الافتتاحية', type: 'number', required: true },
      { key: 'governorate', label: 'المحافظة', type: 'string', required: true },
      { key: 'region', label: 'المنطقة', type: 'string', required: true },
      { key: 'typeId', label: 'فئة الاشتراك', type: 'relation', required: true, relationTable: 'subscriptionTypes' }
    ]
  },
  readings: {
    key: 'readings',
    label: 'القراءات',
    description: 'سجل قراءات العدادات الشهرية',
    columns: [
      { key: 'subscriberId', label: 'المشترك', type: 'relation', required: true, relationTable: 'subscribers' },
      { key: 'periodMonth', label: 'الشهر', type: 'number', required: true, isSummary: true },
      { key: 'periodYear', label: 'السنة', type: 'number', required: true, isSummary: true },
      { key: 'previousReading', label: 'القراءة السابقة', type: 'number', required: true },
      { key: 'currentReading', label: 'القراءة الحالية', type: 'number', required: true, isSummary: true },
      { key: 'units', label: 'الاستهلاك (م³)', type: 'number', required: true, isSummary: true },
      { key: 'totalAmount', label: 'قيمة الاستهلاك', type: 'currency', required: true, isSummary: true },
      { key: 'isPosted', label: 'تم الترحيل', type: 'boolean', required: true }
    ]
  },
  invoices: {
    key: 'invoices',
    label: 'الفواتير',
    description: 'الفواتير الصادرة للمشتركين',
    columns: [
      { key: 'invoiceNumber', label: 'رقم الفاتورة', type: 'string', required: true, isSummary: true },
      { key: 'date', label: 'تاريخ الفاتورة', type: 'date', required: true, isSummary: true },
      { key: 'amount', label: 'المبلغ الأساسي', type: 'currency', required: true },
      { key: 'arrears', label: 'المتأخرات', type: 'currency', required: true },
      { key: 'totalDue', label: 'الإجمالي المطلوب', type: 'currency', required: true, isSummary: true },
      { key: 'status', label: 'حالة السداد', type: 'string', required: true, isSummary: true }
    ]
  },
  receipts: {
    key: 'receipts',
    label: 'المقبوضات',
    description: 'سندات القبض والتحصيل المالي',
    columns: [
      { key: 'reference', label: 'رقم السند', type: 'string', required: true, isSummary: true },
      { key: 'date', label: 'تاريخ السند', type: 'date', required: true, isSummary: true },
      { key: 'subscriberId', label: 'المشترك', type: 'relation', required: true, relationTable: 'subscribers' },
      { key: 'amount', label: 'المبلغ المحصل', type: 'currency', required: true, isSummary: true },
      { key: 'paymentMethod', label: 'طريقة الدفع', type: 'string', required: true },
      { key: 'fundId', label: 'الصندوق المودع', type: 'relation', required: true, relationTable: 'funds' }
    ]
  },
  settlements: {
    key: 'settlements',
    label: 'التسويات',
    description: 'تسويات الأرصدة وتصفير العدادات',
    columns: [
      { key: 'reference', label: 'رقم التسوية', type: 'string', required: true, isSummary: true },
      { key: 'date', label: 'تاريخ التسوية', type: 'date', required: true, isSummary: true },
      { key: 'type', label: 'نوع التسوية', type: 'string', required: true, isSummary: true },
      { key: 'amount', label: 'المبلغ المسوى', type: 'currency', required: true },
      { key: 'description', label: 'البيان والسبب', type: 'string', required: true, isSummary: true }
    ]
  },
  funds: {
    key: 'funds',
    label: 'الصناديق',
    description: 'الخزائن والحسابات النقدية',
    columns: [
      { key: 'name', label: 'اسم الصندوق', type: 'string', required: true, isSummary: true },
      { key: 'balance', label: 'الرصيد الحالي', type: 'currency', required: true, isSummary: true },
      { key: 'manager', label: 'المسؤول', type: 'string', required: true },
      { key: 'branchId', label: 'الفرع', type: 'relation', required: true, relationTable: 'branches' }
    ]
  }
};
