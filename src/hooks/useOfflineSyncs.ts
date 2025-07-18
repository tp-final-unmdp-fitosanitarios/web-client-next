import { useEffect } from 'react';
import { downloadInitialData, syncPendingRequests } from '@/services/offline-service';
import { useAuth } from '@/components/Auth/AuthProvider';

export function useOfflineSync() {
  const { user, token } = useAuth();

  useEffect(() => {
    if (!user || !token) return;

    const isAplicador = user.roles.includes('aplicador');

    // 🔁 Sincroniza y descarga cada 10 minutos
    const interval = setInterval(async () => {
      if (navigator.onLine && isAplicador) {
        await syncPendingRequests(token);
        await downloadInitialData(token);
      }
    }, 10 * 60 * 1000);

    // 🌐 Detecta reconexión y sincroniza al toque
    const onReconnect = async () => {
      if (navigator.onLine && isAplicador) {
        await syncPendingRequests(token);
        await downloadInitialData(token);
      }
    };

    window.addEventListener('online', onReconnect);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', onReconnect);
    };
  }, [user, token]);
}
