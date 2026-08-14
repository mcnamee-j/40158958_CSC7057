import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { reset_password } from "../../api/auth";
import { Api_Error } from "../../api/client";

const ResetPasswordPage = () => {
  const [search_params] = useSearchParams();
  const token = search_params.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handle_submit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Reset link is missing or invalid.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Passwords must be more than 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await reset_password(token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000); // brief delay so user sees the success message before redirect.
    } catch (e) {
      setError(
        e instanceof Api_Error
          ? e.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm flex flex-col items-center gap-6 px-4">
          <div className="text-center">
            <div className="text-2xl font-medium text-green-500">Loop</div>
            <p className="text-sm text-status-danger-text">
              This link is invalid or missing a token. Please request a new one.
            </p>
            <Link to="/forgot_password" className="text-sm text-green-700">
              Request new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 px-4">
        <div className="text-center">
          <div className="text-2xl font-medium text-green-500">Loop</div>
          <div className="text-sm text-green-700">Reset your password</div>
        </div>

        {success ? (
          <p className="text-sm text-status-success-text text-center">
            Password reset successful. Redirecting to login page...
          </p>
        ) : (
          <form onSubmit={handle_submit} className="w-full flex flex-col gap-4">
            <div>
              <label
                htmlFor="new_password"
                className="block text-sm text-green-700 mb-1"
              >
                New Password
              </label>
              <input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-md border border-surface-mid px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="confirm_password"
                className="block text-sm text-green-700 mb-1"
              >
                Confirm New Password
              </label>
              <input
                id="confirm_password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-md border border-surface-mid px-3 py-2 text-sm"
              />
            </div>

            {error && (
              <p className="text-sm text-status-danger-text">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-green-700 py-2 text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
