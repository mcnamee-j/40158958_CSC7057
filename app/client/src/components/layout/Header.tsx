import { Bell, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  get_notifications,
  mark_notifications_read,
  mark_all_notifications_read,
  type Notification,
} from "../../api/notifications";

const REFRESH_INTERVAL_MS = 30 * 1000;

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`
    : "";

  const unread_not_count = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  const retrieve_notifications = async () => {
    try {
      const res = await get_notifications();
      setNotifications(res);
    } catch {
      //keep empty - non critical
    }
  };

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    retrieve_notifications();
    const interval = setInterval(get_notifications, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user]);

  const handle_logout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    const handle_click_away = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handle_click_away);
    return () => document.removeEventListener("mousedown", handle_click_away);
  }, []);

  const handle_notification_click = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await mark_notifications_read(notification.id);
        setNotifications((previous) =>
          previous.map((notif) =>
            notif.id === notification.id ? { ...notif, is_read: true } : notif,
          ),
        );
      } catch {
        //continue to navigate anyways
      }
    }
    setNotificationsOpen(false);
    navigate(`/queries/${notification.query_id}`);
  };

  const handle_mark_all_read = async () => {
    try {
      await mark_all_notifications_read();
      setNotifications((previous) =>
        previous.map((notif) => ({ ...notif, is_read: true })),
      );
    } catch {
      //allow pass through
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-surface-mid/30">
      <span className="text-sm text-green-700">{user?.organisation_name}</span>
      <div className="flex items-center gap-2.5">
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative text-placeholder-text hover:text-green-700 cursor-pointer hover:bg-green-50"
          >
            <Bell size={18} />
            {unread_not_count > 0 && (
              <span className="absolute -top-2 -right-2 bg-status-danger-text text-white text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center">
                {unread_not_count > 9 ? "9+" : unread_not_count}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-surface-mid rounded-md shadow-md z-10">
              <div className="flex items-center justify-between px-3 py-2 border-b border-surface-mid">
                <span className="font-medium text-green-700 text-sm">
                  Notifications
                </span>
                {unread_not_count > 0 && (
                  <button
                    onClick={handle_mark_all_read}
                    className="text-xs text-green-700 hover:underline cursor-pointer"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-placeholder-text px-3 py-4 text-center">
                    No notifications yet
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handle_notification_click(notification)}
                      className={`w-full text-left px-3 py-2.5 text-sm text-green-900 border-b border-surface-mid last:border-b-0 hover:bg-surface-light cursor-pointer ${
                        !notification.is_read ? "bg-status-accent-bg/40" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!notification.is_read && <span></span>}
                        <div>
                          <div>{notification.message}</div>
                          <div className="text-xs text-placeholder-text mt-0.5">
                            {new Date(notification.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 hover:bg-surface-light rounded-md px-1.5 py-1 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-status-accent-bg flex items-center justify-center text-xs font-medium text-status-accent-text">
              {initials}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-medium">
                {user?.first_name} {user?.last_name}
              </div>
              <div className="text-xs text-placeholder-text capitalize">
                {user?.role.replace("_", " ")}
              </div>
            </div>
            <ChevronDown size={14} className="text-placeholder-text" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-surface-mid rounded-md shadow-md py-1 z-10">
              <div className="px-3 py-2 border-b border-surface-mid">
                <div className="text-sm font-medium">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-xs text-placeholder-text">
                  {user?.organisation_name}
                </div>
              </div>
              <button
                onClick={handle_logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-status-danger-text hover:bg-status-danger-bg cursor-pointer"
              >
                <LogOut size={15} />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
