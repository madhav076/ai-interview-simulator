import { api } from "@/lib/axios";

export interface UserSettings {
  theme: "light" | "dark";
  preferredLanguage: string;
  interviewDifficulty: "Easy" | "Medium" | "Hard";
}

export interface SettingsResponse {
  message: string;
  settings: {
    id: string;
    userId: string;
    theme: "light" | "dark";
    preferredLanguage: string;
    interviewDifficulty: "Easy" | "Medium" | "Hard";
    updatedAt: string;
  };
}

export const getSettings = async (): Promise<SettingsResponse> => {
  const response = await api.get("/api/settings");
  return response.data;
};

export const updateSettings = async (data: Partial<UserSettings>): Promise<SettingsResponse> => {
  const response = await api.put("/api/settings", data);
  return response.data;
};
