import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AppShell from './components/layout/AppShell.jsx';
import FinancePage from './features/finance/FinancePage.jsx';
import AgendaPage from './features/agenda/AgendaPage.jsx';
import ConfigPage from './features/config/ConfigPage.jsx';
import AuditPage from './features/audit/AuditPage.jsx';
import { Spinner } from './components/ui/States.jsx';

const PAGES = {
  finance: FinancePage,
  agenda: AgendaPage,
  config: ConfigPage,
  audit: AuditPage,
};

const TAB_KEY = 'gp_tab';

export default function App() {
  const { status } = useAuth();
  const [tab, setTab] = useState(() => {
    const saved = sessionStorage.getItem(TAB_KEY);
    return saved && PAGES[saved] ? saved : 'finance';
  });

  useEffect(() => {
    sessionStorage.setItem(TAB_KEY, tab);
    window.scrollTo({ top: 0 });
  }, [tab]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (status !== 'authed') return <LoginPage />;

  const Page = PAGES[tab];
  return (
    <AppShell tab={tab} onTabChange={setTab}>
      <div key={tab} className="animate-fade-in">
        <Page />
      </div>
    </AppShell>
  );
}
