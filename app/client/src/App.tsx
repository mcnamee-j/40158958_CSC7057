import "./index.css";
import { AuthProvider } from "./context/AuthProvider";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import RestrictedRoute from "./components/auth/RestrictedRoute";
import LoginPage from "./pages/public/LoginPage";
import ForgotPasswordPage from "./pages/public/ForgotPasswordPage";
import ResetPasswordPage from "./pages/public/ResetPasswordPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import QueriesPage from "./pages/queries/QueriesPage";
import QueryThreadPage from "./pages/queries/QueryThreadPage";
import NewQueryPage from "./pages/queries/NewQueryPage";
import UserLayout from "./components/layout/UserLayout";
import RoleCheckRoute from "./components/auth/RoleCheckRoute";
import AdminHomePage from "./pages/admin/AdminHomePage";
import StaffPage from "./pages/staff/StaffPage";
import ProfilePage from "./pages/staff/ProfilePage";

const ALLOWED_ORG_ROLES = [
  "pharmacy_staff",
  "pharmacy_manager",
  "practice_staff",
  "practice_manager",
];

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot_password" element={<ForgotPasswordPage />} />
          <Route path="/reset_password" element={<ResetPasswordPage />} />

          <Route element={<RestrictedRoute />}>
            <Route element={<UserLayout />}>
              <Route
                element={
                  <RoleCheckRoute
                    allowed_roles={ALLOWED_ORG_ROLES}
                    redirect_to="/admin"
                  />
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route path="/queries" element={<QueriesPage />} />
                <Route path="/queries/:id" element={<QueryThreadPage />} />
                <Route path="/new-query" element={<NewQueryPage />} />
                <Route path="/staff" element={<StaffPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              <Route path="/admin" element={<AdminHomePage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
