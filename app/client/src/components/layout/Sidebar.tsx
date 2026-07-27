import { NavLink } from "react-router-dom";
import { LayoutDashboard, Inbox, Plus } from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/queries", label: "Queries", icon: Inbox, end: true },
  { to: "/new-query", label: "New Query", icon: Plus, end: true },
];

const Sidebar = () => {
  return (
    <div className="w-40 shrink-0 bg-green-100 text-white flex flex-col gap-1 p-3 rounded-l-xl">
      <div>Loop</div>
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
