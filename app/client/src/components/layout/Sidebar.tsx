import { NavLink } from "react-router-dom";
import { LayoutDashboard, Inbox, Plus, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { get_performance_stats, type Statistics } from "../../api/reports";
import { useEffect, useState } from "react";

const format_time = (seconds: number | null): string => {
  if (seconds === null) return "N/A";
  const hours = seconds / 3600; // 60 seconds in 1 min. 60 mins in 1 hr - 60 x 60
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`; //days
};

const Sidebar = () => {
  const { user } = useAuth();
  const is_admin = user?.role === "admin";
  const is_manager =
    user?.role === "pharmacy_manager" || user?.role === "practice_manager";

  const [stats, setStats] = useState<Statistics | null>(null);

  useEffect(() => {
    if (!is_manager) return;
    get_performance_stats()
      .then(setStats)
      .catch(() => setStats(null));
  }, [is_manager]);

  const navItems = is_admin
    ? [
        { to: "/admin", label: "Admin", icon: ShieldCheck, end: true },
        { to: "/staff", label: "Staff", icon: Users, end: false },
      ]
    : [
        { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
        { to: "/queries", label: "Queries", icon: Inbox, end: false },
        { to: "/new-query", label: "New query", icon: Plus, end: false },
        ...(is_manager
          ? [{ to: "/staff", label: "Staff", icon: Users, end: false }]
          : []),
      ];

  return (
    <div className="w-full md:w-40 md-shrink-0 bg-green-300 text-white flex flex-row md:flex-col gap-1 p-3 md:p-3 md-rounded-l-xl overflow-x-auto">
      <div className="hidden md:block text-xl font-medium px-2 pb-5">Loop</div>
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-2 px-2.5 py-2 rounded-md text-sm hover:bg-white/20 shrink-0 ${isActive ? "bg-white/15" : "opacity-85 hover:opacity-100"}`
          }
        >
          <Icon size={16} />
          <span className="hidden sm:inline">{label}</span>
        </NavLink>
      ))}

      {is_manager && stats && (
        <div className="hidden md:flex flex-col gap-1.5 mt-auto pt-3 border-t border-white/20 text-xs">
          <div className="opacity-70">Resolution Stats</div>
          <div className="flex justify-between">
            <span className="opacity-80">Resolved</span>
            <span className="font-medium">{stats.percentage_resolved}%</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-80">Avg Time</span>
            <span className="font-medium">
              {format_time(stats.avg_resolution_seconds)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
