import { ReactNode, useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Users, UserPlus, Settings, LogOut, Bell, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';
import { translations, Language } from '../../lib/translations';

interface LayoutProps {
  children: ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const Layout = ({ children, activePage, onNavigate, onLogout }: LayoutProps) => {
  const [langOpen, setLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [currentLang, setCurrentLang] = useState<Language>((user.language as Language) || 'English');

  const t = translations[currentLang] || translations.English;

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'entry', label: t.addChild, icon: UserPlus },
    { id: 'records', label: t.records, icon: Users },
    { id: 'alerts', label: t.anemiaAlerts, icon: Bell },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  const languages = ['English', 'Hindi', 'Marathi', 'Telugu', 'Bengali', 'Tamil', 'Gujarati', 'Kannada', 'Odia', 'Malayalam'];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLangChange = async (lang: string) => {
    setCurrentLang(lang);
    setLangOpen(false);
    
    // Update local state and storage
    const updatedUser = { ...user, language: lang };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('languageChange'));
    
    // Sync with backend if possible
    try {
      await api.updateProfile(updatedUser);
    } catch (e) {
      console.error('Failed to sync language', e);
    }
  };

  return (
    <div className="min-h-screen bg-page-bg flex font-sans text-dark-text">
      {/* Sidebar */}
      <aside className="w-60 geometric-sidebar flex flex-col pt-8 pb-8 fixed h-full z-10 shadow-lg border-r border-dark-text/5">
        <div className="px-8 mb-10 flex flex-col gap-2">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm">
            👶
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight">NutriTrack</h1>
            <p className="text-[10px] uppercase font-bold opacity-70 tracking-widest">Anganwadi Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-0 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-8 py-4 transition-all text-sm font-bold ${
                activePage === item.id
                  ? 'bg-white/40 border-r-4 border-dark-text/30 text-dark-text'
                  : 'text-dark-text/70 hover:bg-white/10'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activePage === item.id ? 'text-trust-blue' : ''}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-8 mt-auto pt-8 border-t border-dark-text/10">
          <div className="mb-4 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-white/50 border border-white/20 p-1 overflow-hidden">
                <img 
                  src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                  alt="Profile" 
                  className="w-full h-full rounded-lg object-cover"
                />
             </div>
             <div>
                <p className="text-[10px] font-bold opacity-60 uppercase">Logged in as</p>
                <p className="font-bold text-xs truncate max-w-[100px]">
                  {user.name || 'Worker'}
                </p>
             </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-xs font-bold text-dark-text hover:underline opacity-80"
          >
            <LogOut className="w-4 h-4" />
            {t.signOut}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-60 flex-1 p-10 min-h-screen flex flex-col gap-8 relative">
        <header className="header flex justify-between items-center relative z-20">
          <div className="welcome-text">
            <h2 className="text-2xl font-extrabold text-dark-text capitalize">
              {activePage === 'dashboard' ? t.dashboard : menuItems.find(m => m.id === activePage)?.label || activePage.replace('-', ' ')}
            </h2>
            <p className="text-dark-text/60 text-sm font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {t.welcome}, {user.name || 'Worker'}
            </p>
          </div>
          <div className="flex items-center gap-4 relative">
            <div ref={dropdownRef} className="relative">
              <button 
                onClick={() => setLangOpen(!langOpen)}
                className={`glass-effect px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${langOpen ? 'bg-white/60 shadow-inner' : 'hover:bg-white/40 shadow-sm'}`}
              >
                <span>🇮🇳</span>
                <span>{currentLang}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {langOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden py-2"
                  >
                    <div className="px-3 pb-2 border-b border-gray-100 mb-2">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Language</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {languages.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => handleLangChange(lang)}
                          className="w-full flex items-center justify-between px-4 py-2 text-left text-xs font-bold hover:bg-trust-blue/10 transition-colors group"
                        >
                          <span className={currentLang === lang ? 'text-trust-blue' : 'text-dark-text/70'}>{lang}</span>
                          {currentLang === lang && <Check className="w-3 h-3 text-trust-blue" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => onNavigate('alerts')}
              className="w-10 h-10 rounded-xl bg-energy-orange flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all text-dark-text"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        <motion.div
  key={activePage}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  className="flex-1"
>
  {children}
</motion.div>
      </main>
    </div>
  );
};
