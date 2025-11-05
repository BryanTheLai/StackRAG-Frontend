import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/supabase/client";
import Sidebar from "@/components/Sidebar";
import Notification from "@/components/Notification";
import { type Profile, type AppSettings, DEFAULT_APP_SETTINGS } from "@/types/profile";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tempProfile, setTempProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{id: number; message: React.ReactNode} | null>(null);

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "full_name, company_name, role_in_company, app_settings, created_at, updated_at"
        )
        .eq("id", user.id)
        .single<Profile>();
      if (error) {
        setError(error.message);
      } else if (data) {
        setProfile(data);
        setTempProfile(data);
      }
      setLoading(false);
    };
    loadProfile();
  }, [user]);

  const handleFieldSave = async (field: keyof Profile) => {
    if (!user || !profile) return;
    const newValue = tempProfile[field] ?? profile[field];
    if (newValue === profile[field]) return;
    try {
      await supabase.from('profiles').update({ [field]: newValue }).eq('id', user.id);
      setProfile(prev => prev ? { ...prev, [field]: newValue as any } : prev);
      setNotification({ id: Date.now(), message: `${field.replace('_', ' ')} saved` });
    } catch (e: any) {
      setNotification({ id: Date.now(), message: `Error saving ${field}: ${e.message}` });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center text-error p-4">
        Error loading profile: {error}
      </div>
    );
  }
  if (!profile) {
    return <div className="text-center p-4">No profile found.</div>;
  }

  // Helper to update app settings
  const handleSettingUpdate = async (key: keyof AppSettings, value: any) => {
    if (!user || !profile) return;
    
    const updatedSettings = {
      ...DEFAULT_APP_SETTINGS,
      ...(profile.app_settings || {}),
      [key]: value,
    };
    
    try {
      await supabase.from('profiles').update({ app_settings: updatedSettings }).eq('id', user.id);
      setProfile(prev => prev ? { ...prev, app_settings: updatedSettings } : prev);
      setNotification({ id: Date.now(), message: `${key} updated` });
    } catch (e: any) {
      setNotification({ id: Date.now(), message: `Error updating ${key}: ${e.message}` });
    }
  };

  const settings = { ...DEFAULT_APP_SETTINGS, ...(profile?.app_settings || {}) };

  return (
    <div className="flex h-screen bg-base-200 text-base-content">
      <Sidebar />
      <div className="flex-1 p-6 relative overflow-y-auto">
        {notification && (
          <Notification key={notification.id} message={notification.message} onClose={() => setNotification(null)} />
        )}
        <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
        
        {/* Personal Information Section */}
        <div className="card bg-base-100 shadow-md mb-6">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">Personal Information</h2>
            
            {/* Full Name Field */}
            <div className="flex items-center mb-4 gap-2">
              <label className="font-semibold w-40 text-lg">Full Name:</label>
              <input
                className="input input-bordered input-md flex-1 text-lg"
                value={tempProfile.full_name ?? profile.full_name ?? ''}
                onChange={e => setTempProfile(prev => ({ ...prev, full_name: e.target.value }))}
                onBlur={() => handleFieldSave('full_name')}
                onKeyDown={e => {
                  if (e.key === 'Enter') { handleFieldSave('full_name'); e.currentTarget.blur(); }
                }}
              />
            </div>
            
            {/* Company Name Field */}
            <div className="flex items-center mb-4 gap-2">
              <label className="font-semibold w-40 text-lg">Company Name:</label>
              <input
                className="input input-bordered input-md flex-1 text-lg"
                value={tempProfile.company_name ?? profile.company_name ?? ''}
                onChange={e => setTempProfile(prev => ({ ...prev, company_name: e.target.value }))}
                onBlur={() => handleFieldSave('company_name')}
                onKeyDown={e => {
                  if (e.key === 'Enter') { handleFieldSave('company_name'); e.currentTarget.blur(); }
                }}
              />
            </div>
            
            {/* Role Field */}
            <div className="flex items-center mb-4 gap-2">
              <label className="font-semibold w-40 text-lg">Role:</label>
              <input
                className="input input-bordered input-md flex-1 text-lg"
                value={tempProfile.role_in_company ?? profile.role_in_company ?? ''}
                onChange={e => setTempProfile(prev => ({ ...prev, role_in_company: e.target.value }))}
                onBlur={() => handleFieldSave('role_in_company')}
                onKeyDown={e => {
                  if (e.key === 'Enter') { handleFieldSave('role_in_company'); e.currentTarget.blur(); }
                }}
              />
            </div>
          </div>
        </div>

        {/* App Settings Section */}
        <div className="card bg-base-100 shadow-md mb-6">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">Application Settings</h2>
            
            <div className="alert alert-info mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div>
                <div className="font-bold">These settings apply across the app</div>
                <div className="text-xs">Changes take effect immediately on all dashboards and views</div>
              </div>
            </div>

            {/* Currency Preference */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-semibold">Default Currency</span>
                <span className="label-text-alt">Used for all financial displays</span>
              </label>
              <select
                className="select select-bordered"
                value={settings.currency}
                onChange={e => handleSettingUpdate('currency', e.target.value)}
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="JPY">JPY (¥) - Japanese Yen</option>
                <option value="CAD">CAD (C$) - Canadian Dollar</option>
                <option value="AUD">AUD (A$) - Australian Dollar</option>
              </select>
            </div>

            {/* Chart Type Preference */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-semibold">Chart Type</span>
                <span className="label-text-alt">Visualization style for dashboard charts</span>
              </label>
              <select
                className="select select-bordered"
                value={settings.chartType}
                onChange={e => handleSettingUpdate('chartType', e.target.value)}
              >
                <option value="bar">Bar Chart - Compare values side by side</option>
                <option value="line">Line Chart - Show trends over time</option>
              </select>
            </div>

            <div className="divider">Coming Soon</div>
            
            <div className="opacity-50 space-y-3">
              <div className="form-control">
                <label className="label cursor-not-allowed">
                  <span className="label-text">Date Format (Coming Soon)</span>
                  <span className="badge badge-sm">Future</span>
                </label>
                <select className="select select-bordered" disabled>
                  <option>MM/DD/YYYY (US)</option>
                </select>
              </div>
              
              <div className="form-control">
                <label className="label cursor-not-allowed">
                  <span className="label-text">Default Dashboard View (Coming Soon)</span>
                  <span className="badge badge-sm">Future</span>
                </label>
                <select className="select select-bordered" disabled>
                  <option>Monthly</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">Account Information</h2>
            <div className="text-sm text-base-content/70 space-y-1">
              <div><span className="font-semibold">Account Created:</span> {new Date(profile.created_at).toLocaleString()}</div>
              <div><span className="font-semibold">Last Updated:</span> {new Date(profile.updated_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
