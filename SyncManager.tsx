import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { offlineDb } from '../lib/offlineDb';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SyncManager = () => {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      api.syncOfflineData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check for pending data
    const checkPending = async () => {
      const requests = await offlineDb.getAllRequests();
      setPendingCount(requests.length);
    };
    
    checkPending();
    
    const interval = setInterval(async () => {
      if (window.navigator.onLine) {
        setSyncing(true);
        await api.syncOfflineData();
        setSyncing(false);
      }
      checkPending();
    }, 30000); // Sync every 30 seconds if online

    const handleSyncComplete = () => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      checkPending();
    };
    window.addEventListener('syncComplete', handleSyncComplete);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('syncComplete', handleSyncComplete);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {!isOnline && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
          >
            <WifiOff className="w-4 h-4" />
            Offline Mode
          </motion.div>
        )}

        {pendingCount > 0 && isOnline && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-trust-blue text-white pl-4 pr-2 py-2 rounded-full shadow-lg flex items-center gap-3 text-xs font-bold uppercase tracking-wider pointer-events-auto"
          >
            <div className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {pendingCount} Pending Syncs
            </div>
            <button 
              onClick={() => api.syncOfflineData()}
              disabled={syncing}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
            >
              Sync Now
            </button>
          </motion.div>
        )}

        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-health-green text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
          >
            <CheckCircle2 className="w-4 h-4" />
            Sync Complete
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
