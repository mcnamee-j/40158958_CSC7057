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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<RestrictedRoute />}>
            <Route element={<UserLayout />}>
              <Route path="/" element={<DashboardPage />}></Route>
              <Route path="/queries" element={<QueriesPage />}></Route>
              <Route path="/queries/:id" element={<QueryThreadPage />}></Route>
              <Route path="/new-query" element={<NewQueryPage />}></Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
