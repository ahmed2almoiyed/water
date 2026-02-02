
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Subscribers } from './pages/Subscribers';
import { Suppliers } from './pages/Suppliers';
import { Readings } from './pages/Readings';
import { Receipts } from './pages/Receipts';
import { Expenses } from './pages/Expenses';
import { Reports } from './pages/Reports';
import { RevenueReport } from './pages/RevenueReport';
import { FundLedger } from './pages/FundLedger';
import { CollectorLedger } from './pages/CollectorLedger';
import { ReportDesigner } from './pages/ReportDesigner';
import { Settings } from './pages/Settings';
import { SubscriberStatement } from './pages/SubscriberStatement';
import { QuickReadings } from './pages/QuickReadings';
import { Funds } from './pages/Funds';
import { Collectors } from './pages/Collectors';
import { Users } from './pages/Users';
import { InvoicePrint } from './pages/InvoicePrint';
import { ReceiptPrint } from './pages/ReceiptPrint';
import { SubscriptionTypes } from './pages/SubscriptionTypes';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = React.useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('auth_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/quick-readings" element={<QuickReadings />} />
          <Route path="/subscribers" element={<Subscribers />} />
          <Route path="/subscription-types" element={<SubscriptionTypes />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/funds" element={<Funds />} />
          <Route path="/collectors" element={<Collectors />} />
          <Route path="/statement/:id" element={<SubscriberStatement />} />
          <Route path="/invoice/:id" element={<InvoicePrint />} />
          <Route path="/receipt-print/:id" element={<ReceiptPrint />} />
          <Route path="/readings" element={<Readings />} />
          <Route path="/receipts" element={<Receipts />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/revenue-report" element={<RevenueReport />} />
          <Route path="/fund-ledger" element={<FundLedger />} />
          <Route path="/collector-ledger" element={<CollectorLedger />} />
          <Route path="/report-designer" element={<ReportDesigner />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
