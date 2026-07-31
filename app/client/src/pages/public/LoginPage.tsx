import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Api_Error } from "../../api/client";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  //submit is clicked
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (e) {
      if (e instanceof Api_Error) {
        setError(e.message); //string as defined above
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm flex-col items-center gap-6 px-4">
        <div className="text-center">
          <div className="text-2xl font-medium text-green-500">Loop</div>
          <div className="text-sm text-green-300">Keeping you in the loop</div>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm text-green-500 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@organisation.com"
              required
              className="w-full border border-surface-mid px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm text-green-500 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full border border-surface-mid px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-sm text-status-danager-text">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-green-700 py-2 text-sm font-medium text-white diabled:opacity-60"
          >
            {submitting ? "Logging in..." : "Log in"}
          </button>

          <p className="text-center text-xs text-placeholder-text">
            For authorised users only
          </p>
          <Link
            to="/forgot_password"
            className="text-center text-sm text-green-700"
          >
            Forgot password?
          </Link>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
