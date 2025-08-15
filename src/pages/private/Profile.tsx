import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/supabase/client";
import Sidebar from "@/components/Sidebar";
import Notification from "@/components/Notification";

interface Profile {
  full_name: string | null;
  company_name: string | null;
  role_in_company: string | null;
  app_settings: any;
  created_at: string;
  updated_at: string;
}

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

  return (
    <div className="flex h-screen bg-base-200 text-base-content">
      <Sidebar />
      <div className="flex-1 p-6 relative">
        {notification && (
          <Notification key={notification.id} message={notification.message} onClose={() => setNotification(null)} />
        )}
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
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
            {/* App Settings Display */}
            {/* {profile.app_settings && (
              <div>
                <span className="font-semibold">Settings:</span>{" "}
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(profile.app_settings, null, 2)}
                </pre>
              </div>
            )} */}
            {/* Timestamps */}
            <div className="text-sm text-base-content/70">
              <div>Created: {new Date(profile.created_at).toLocaleString()}</div>
              <div>Last Updated: {new Date(profile.updated_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
