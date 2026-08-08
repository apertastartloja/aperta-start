import { supabase } from "@/lib/supabase";
import { mockNotifications } from "@/mocks/notifications.mock";
import { playNotificationSound } from "@/utils/notification-sound";
import type { AdminNotification, NotificationCategory, NotificationPriority } from "@/types";
import { clone, delay } from "./base.service";

let localNotificationsStore: AdminNotification[] = clone(mockNotifications);

// Realtime callbacks list
type RealtimeCallback = (notification: AdminNotification) => void;
const subscribers: Set<RealtimeCallback> = new Set();

export const NotificationService = {
  /**
   * Fetch all notifications
   */
  async listAll(): Promise<AdminNotification[]> {
    try {
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((n) => ({
          id: n.id,
          type: n.type,
          category: n.category as NotificationCategory,
          priority: n.priority as NotificationPriority,
          title: n.title,
          message: n.message,
          linkHref: n.link_href || undefined,
          read: Boolean(n.read),
          readAt: n.read_at || null,
          metadata: n.metadata || undefined,
          createdAt: n.created_at || new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.warn("Supabase admin_notifications offline, usando fallback local:", err);
    }
    return delay(clone(localNotificationsStore));
  },

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    const list = await this.listAll();
    return list.filter((n) => !n.read).length;
  },

  /**
   * Mark single notification as read
   */
  async markAsRead(id: string): Promise<AdminNotification | null> {
    const idx = localNotificationsStore.findIndex((n) => n.id === id);
    const nowIso = new Date().toISOString();

    if (idx >= 0) {
      localNotificationsStore[idx] = {
        ...localNotificationsStore[idx]!,
        read: true,
        readAt: nowIso,
      };
    }

    try {
      await supabase
        .from("admin_notifications")
        .update({ read: true, read_at: nowIso })
        .eq("id", id);
    } catch {
      // Fallback
    }

    return delay(idx >= 0 ? clone(localNotificationsStore[idx]!) : null);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<boolean> {
    const nowIso = new Date().toISOString();
    localNotificationsStore = localNotificationsStore.map((n) => ({
      ...n,
      read: true,
      readAt: nowIso,
    }));

    try {
      await supabase
        .from("admin_notifications")
        .update({ read: true, read_at: nowIso })
        .eq("read", false);
    } catch {
      // Fallback
    }

    return delay(true);
  },

  /**
   * Delete single notification
   */
  async delete(id: string): Promise<boolean> {
    localNotificationsStore = localNotificationsStore.filter((n) => n.id !== id);

    try {
      await supabase.from("admin_notifications").delete().eq("id", id);
    } catch {
      // Fallback
    }

    return delay(true);
  },

  /**
   * Delete multiple notifications
   */
  async deleteMany(ids: string[]): Promise<boolean> {
    const setIds = new Set(ids);
    localNotificationsStore = localNotificationsStore.filter((n) => !setIds.has(n.id));

    try {
      await supabase.from("admin_notifications").delete().in("id", ids);
    } catch {
      // Fallback
    }

    return delay(true);
  },

  /**
   * Purge read notifications older than X days (default 30 days)
   */
  async purgeOldRead(days: number = 30): Promise<number> {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    const initialCount = localNotificationsStore.length;

    localNotificationsStore = localNotificationsStore.filter((n) => {
      if (!n.read) return true; // Keep unread
      const created = new Date(n.createdAt).getTime();
      return created >= cutoffTime; // Keep if younger than cutoff
    });

    const deletedCount = initialCount - localNotificationsStore.length;

    try {
      const cutoffIso = new Date(cutoffTime).toISOString();
      await supabase
        .from("admin_notifications")
        .delete()
        .eq("read", true)
        .lt("created_at", cutoffIso);
    } catch {
      // Fallback
    }

    return delay(deletedCount);
  },

  /**
   * Create a new notification (with 1-hour deduplication and audio alert)
   */
  async create(input: Omit<AdminNotification, "id" | "read" | "createdAt">): Promise<AdminNotification> {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    // Check deduplication: same type and title created in the last 1 hour
    const existingIdx = localNotificationsStore.findIndex(
      (n) =>
        n.type === input.type &&
        n.title === input.title &&
        !n.read &&
        new Date(n.createdAt).getTime() >= oneHourAgo
    );

    if (existingIdx >= 0) {
      // Update existing notification timestamp instead of creating duplicate
      const updated: AdminNotification = {
        ...localNotificationsStore[existingIdx]!,
        message: input.message,
        createdAt: new Date().toISOString(),
      };
      localNotificationsStore[existingIdx] = updated;

      try {
        await supabase
          .from("admin_notifications")
          .update({
            message: input.message,
            created_at: updated.createdAt,
          })
          .eq("id", updated.id);
      } catch {
        // Fallback
      }

      return delay(clone(updated));
    }

    // New notification
    const newNotif: AdminNotification = {
      ...input,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };

    localNotificationsStore.unshift(newNotif);

    // Play notification chime sound for high or critical priority
    if (newNotif.priority === "high" || newNotif.priority === "critical") {
      playNotificationSound(newNotif.priority);
    }

    try {
      await supabase.from("admin_notifications").insert({
        id: newNotif.id,
        type: newNotif.type,
        category: newNotif.category,
        priority: newNotif.priority,
        title: newNotif.title,
        message: newNotif.message,
        link_href: newNotif.linkHref,
        metadata: newNotif.metadata,
        read: false,
        created_at: newNotif.createdAt,
      });
    } catch {
      // Fallback
    }

    // Notify realtime local subscribers
    subscribers.forEach((cb) => cb(newNotif));

    return delay(clone(newNotif));
  },

  /**
   * Subscribe to live Realtime updates from Supabase Channel
   */
  subscribeToRealtime(onNotification: RealtimeCallback): () => void {
    subscribers.add(onNotification);

    try {
      const channel = supabase
        .channel("admin_notifications_channel")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "admin_notifications" },
          (payload) => {
            const raw = payload.new as any;
            if (raw) {
              const notif: AdminNotification = {
                id: raw.id,
                type: raw.type,
                category: raw.category,
                priority: raw.priority,
                title: raw.title,
                message: raw.message,
                linkHref: raw.link_href || undefined,
                read: Boolean(raw.read),
                readAt: raw.read_at || null,
                metadata: raw.metadata || undefined,
                createdAt: raw.created_at || new Date().toISOString(),
              };

              if (notif.priority === "high" || notif.priority === "critical") {
                playNotificationSound(notif.priority);
              }

              onNotification(notif);
            }
          }
        )
        .subscribe();

      return () => {
        subscribers.delete(onNotification);
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn("Erro ao registrar Supabase Realtime channel:", err);
      return () => subscribers.delete(onNotification);
    }
  },
};
