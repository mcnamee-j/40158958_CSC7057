import { useState } from "react";
import { Link } from "react-router-dom";
import { forgot_password } from "../../api/auth";
import { Api_Error } from "../../api/client";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handle_submit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await forgot_password(email);
      setSubmitted(true);
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

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 px-4">
        <div className="text-center">
          <div className="text-2xl font-medium text-green-500">Loop</div>
          <div className="text-sm text-green-300">Keeping you in the loop</div>
        </div>

        {submitted ? (
          <div className="w-full flex flex-col gap-4 text-center">
            <p className="text-sm text-green-900">
              If an account exists with that email, a reset link has been sent.
            </p>
            <Link to="/login" className="text-sm text-green-700">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handle_submit} className="w-full flex flex-col gap-4">
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
                placeholder="name@org.com"
                required
                className="w-full rounded-md border border-surface-mid px-3 py-2 text-sm"
              />
            </div>

            {error && (
              <p className="text-sm text-status-danger-text">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-green-700 py-2 text-white text-sm font-medium disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Sending..." : "Send reset link"}
            </button>

            <Link to="/login" className="text-center text-sm text-green-700">
              Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
