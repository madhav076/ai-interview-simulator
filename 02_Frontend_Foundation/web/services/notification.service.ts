import { api } from "@/lib/axios";

export interface NotificationRecord {
  _id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  message: string;
  notifications: NotificationRecord[];
}

export const getUserNotifications = async (): Promise<NotificationsResponse> => {
  const response = await api.get("/api/notification");
  return response.data;
};

export const markNotificationAsRead = async (id: string) => {
  const response = await api.put(`/api/notification/${id}/read`);
  return response.data;
};
