import { Bell, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`
    : "";

  const handle_logout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    const handle_click_away = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handle_click_away);
    return () => document.removeEventListener("mousedown", handle_click_away);
  }, []);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-surface-mid/30">
      <span className="text-sm text-green-700">{user?.organisation_name}</span>
      <div className="flex items-center gap-2.5">
        <Bell
          size={18}
          className="text-placeholder-text"
          aria-label="Notifications"
        />
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
