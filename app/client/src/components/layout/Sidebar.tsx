import { NavLink } from "react-router-dom";
import { LayoutDashboard, Inbox, Plus, ShieldCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Sidebar = () => {
  const { user } = useAuth();
  const is_admin = user?.role === "admin";

  const navItems = is_admin
    ? [{ to: "/admin", label: "Admin", icon: ShieldCheck, end: true }]
    : [
        { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
        { to: "/queries", label: "Queries", icon: Inbox, end: false },
        { to: "/new-query", label: "New query", icon: Plus, end: false },
      ];

  return (
    <div className="w-50 shrink-0 bg-green-300 text-white flex flex-col gap-1 p-3">
      <div className="py-3">
        <p className="text-xl pl-2 pb-1.5">Loop</p>
      </div>
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-2 px-2.5 py-2 rounded-md text-sm ${isActive ? "bg-white/15" : "opacity-85 hover:opacity-100"}`
          }
        >
          <Icon size={16} />
          {label}
        </NavLink>
      ))}
    </div>
  );
};

export default Sidebar;
