"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardBody, Button } from "@/components/ui";
import { Settings as SettingsIcon, User, Sliders, Shield, AlertCircle, Save, Check, Sun, Moon, Laptop } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useThemeStore } from "@/store/theme.store";
import { getSettings, updateSettings, UserSettings } from "@/services/settings.service";
import { format } from "date-fns";

interface LocalSettings {
  theme: "light" | "dark" | "system";
  preferredLanguage: string;
  interviewDifficulty: "Easy" | "Medium" | "Hard";
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme: storeTheme, setTheme: setStoreTheme } = useThemeStore();
  
  const [settings, setSettings] = useState<LocalSettings>({
    theme: "system",
    preferredLanguage: "English",
    interviewDifficulty: "Medium",
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getSettings();
        if (data.settings) {
          setSettings({
            theme: data.settings.theme as "light" | "dark" | "system",
            preferredLanguage: data.settings.preferredLanguage,
            interviewDifficulty: data.settings.interviewDifficulty,
          });
          // Sync with the global store
          setStoreTheme(data.settings.theme as "light" | "dark" | "system");
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [setStoreTheme]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccessMsg("");
      
      // Map theme value compatible with backend (database supports light/dark only)
      const apiTheme = settings.theme === "system" ? "dark" : settings.theme;
      await updateSettings({
        theme: apiTheme,
        preferredLanguage: settings.preferredLanguage,
        interviewDifficulty: settings.interviewDifficulty,
      });
      
      setSuccessMsg("Settings saved successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setSettings((prev) => ({ ...prev, theme: newTheme }));
    setStoreTheme(newTheme);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-500"></div>
          <p className="text-xs text-slate-400 dark:text-zinc-500 animate-pulse">Loading settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              Settings
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">
            Manage your account preferences and application settings.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2 text-xs py-1.5 px-3.5 mt-4 md:mt-0">
          {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-medium">
          {successMsg}
        </div>
      )}

      {/* Profile Settings */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Profile Settings</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Full Name</span>
              <div className="mt-1 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/10 px-4 py-2.5 text-sm text-slate-600 dark:text-zinc-400 font-medium">
                {user?.name || "Loading..."}
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Email Address</span>
              <div className="mt-1 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/10 px-4 py-2.5 text-sm text-slate-600 dark:text-zinc-400 font-medium">
                {user?.email || "Loading..."}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Theme Cards (Application Preferences Part 1) */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Appearance</h2>
          </div>
        </CardHeader>
        <CardBody>
          <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Theme Mode</span>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Light Mode Card */}
            <button
              type="button"
              onClick={() => handleThemeChange("light")}
              className={`flex flex-col items-center justify-between p-4 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                settings.theme === "light"
                  ? "border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/15 bg-indigo-50/10 dark:bg-indigo-950/5"
                  : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950"
              }`}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`p-2 rounded-lg ${settings.theme === "light" ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 dark:bg-zinc-900 text-slate-400"}`}>
                  <Sun size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">Light</p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">Perfect for daytime</p>
                </div>
              </div>
              <div className="mt-4 flex w-full justify-end">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${settings.theme === "light" ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 dark:border-zinc-700"}`}>
                  {settings.theme === "light" && <Check size={12} />}
                </div>
              </div>
            </button>

            {/* Dark Mode Card */}
            <button
              type="button"
              onClick={() => handleThemeChange("dark")}
              className={`flex flex-col items-center justify-between p-4 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                settings.theme === "dark"
                  ? "border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/15 bg-indigo-50/10 dark:bg-indigo-950/5"
                  : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950"
              }`}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`p-2 rounded-lg ${settings.theme === "dark" ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-400" : "bg-slate-50 dark:bg-zinc-900 text-slate-400"}`}>
                  <Moon size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">Dark</p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">Easier on the eyes</p>
                </div>
              </div>
              <div className="mt-4 flex w-full justify-end">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${settings.theme === "dark" ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 dark:border-zinc-700"}`}>
                  {settings.theme === "dark" && <Check size={12} />}
                </div>
              </div>
            </button>

            {/* System Mode Card */}
            <button
              type="button"
              onClick={() => handleThemeChange("system")}
              className={`flex flex-col items-center justify-between p-4 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                settings.theme === "system"
                  ? "border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/15 bg-indigo-50/10 dark:bg-indigo-950/5"
                  : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950"
              }`}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`p-2 rounded-lg ${settings.theme === "system" ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-400" : "bg-slate-50 dark:bg-zinc-900 text-slate-400"}`}>
                  <Laptop size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">System</p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">Sync with system theme</p>
                </div>
              </div>
              <div className="mt-4 flex w-full justify-end">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${settings.theme === "system" ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 dark:border-zinc-700"}`}>
                  {settings.theme === "system" && <Check size={12} />}
                </div>
              </div>
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Application Preferences Part 2 */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Preferences</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Preferred Language</span>
              <select
                className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2 text-sm text-slate-900 dark:text-zinc-100 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                value={settings.preferredLanguage}
                onChange={(e) => setSettings({ ...settings, preferredLanguage: e.target.value })}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Default Interview Difficulty</span>
              <select
                className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2 text-sm text-slate-900 dark:text-zinc-100 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                value={settings.interviewDifficulty}
                onChange={(e) => setSettings({ ...settings, interviewDifficulty: e.target.value as "Easy" | "Medium" | "Hard" })}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Account Settings */}
      <Card className="mt-6 mb-8">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Account &amp; Security
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4 divide-y divide-slate-100 dark:divide-zinc-800/40">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-semibold text-slate-600 dark:text-zinc-400">
                Two-Factor Authentication
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/50 dark:border-zinc-800 px-2 py-0.5 rounded">Not configured</span>
            </div>
            <div className="flex items-center justify-between pt-4 pb-2">
              <span className="text-sm font-semibold text-slate-600 dark:text-zinc-400">Account Created</span>
              <span className="text-sm text-slate-500 dark:text-zinc-400">
                {user?.createdAt ? format(new Date(user.createdAt), "PPP") : "N/A"}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}
