import { useState, useEffect } from 'react';
import { Layout } from './components/ui/Layout';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { ChildEntry } from './pages/ChildEntry';
import { Records } from './pages/Records';
import { Alerts } from './pages/Alerts';
import { Settings } from './pages/Settings';
import { SyncManager } from './components/SyncManager';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (data: any) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return null;

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout 
      activePage={activePage} 
      onNavigate={setActivePage} 
      onLogout={handleLogout}
    >
      <SyncManager />
      {activePage === 'dashboard' && <Dashboard />}
      {activePage === 'entry' && <ChildEntry />}
      {activePage === 'records' && <Records />}
      {activePage === 'alerts' && <Alerts />}
      {activePage === 'settings' && <Settings />}
    </Layout>
  );
}
