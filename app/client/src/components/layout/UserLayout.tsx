import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useTimeout } from "../../hooks/useTimeout";

const UserLayout = () => {
  useTimeout();
  return (
    <div className="min-h-screen bg-surface-light flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 bg-white rounded-none md:rounded-r-xl flex flex-col">
        <Header />
        <div className="flex-1 px-4 md:px-6 py-4 pb-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
