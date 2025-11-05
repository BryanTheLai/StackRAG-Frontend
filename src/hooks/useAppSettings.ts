import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/supabase/client';
import { type AppSettings, DEFAULT_APP_SETTINGS } from '@/types/profile';

/**
 * Hook to access user app settings
 * Returns default settings if not authenticated or no settings found
 */
export function useAppSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSettings(DEFAULT_APP_SETTINGS);
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('app_settings')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading app settings:', error);
          setSettings(DEFAULT_APP_SETTINGS);
        } else {
          setSettings({
            ...DEFAULT_APP_SETTINGS,
            ...(data?.app_settings || {}),
          });
        }
      } catch (e) {
        console.error('Error loading app settings:', e);
        setSettings(DEFAULT_APP_SETTINGS);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  return { settings, loading };
}
