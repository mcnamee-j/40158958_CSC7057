import { api } from "./client";

export interface Notification {
  id: number;
  query_id: number;
  type: "query_reply" | "query_updated" | "query_assigned";
  message: string;
  is_read: boolean;
  created_at: string;
}

export const get_notifications = async (): Promise<Notification[]> => {
  const { data } = await api.get<{ notifications: Notification[] }>(
    "/api/notifications",
  );
  return data.notifications;
};

export const mark_notifications_read = (id: number) => {
  api.patch(`/api/notifications/${id}/read`);
};

export const mark_all_notifications_read = () => {
  api.patch("/api/notifications/read-all");
};
