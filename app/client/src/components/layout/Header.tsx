import { Bell } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Header = () => {
  const { user } = useAuth();

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`
    : "";

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <span className="text-sm text-green-700">
        User Organisation goes here
      </span>
      <div className="flex items-center gap-2.5">
        <Bell
          size={18}
          className="text-placeholder-text"
          aria-label="Notifications"
        />
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
      </div>
    </div>
  );
};

export default Header;
