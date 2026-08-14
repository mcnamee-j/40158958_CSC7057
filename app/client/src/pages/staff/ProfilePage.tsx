import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { update_profile } from "../../api/auth";
import { Api_Error } from "../../api/client";
import { format_label } from "../../utils/format";

const ProfilePage = () => {
  const { user, refresh_user } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handle_submit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await update_profile({
        first_name: firstName,
        last_name: lastName,
        email,
      });
      await refresh_user();
      setSuccess(true);
    } catch (e) {
      setError(
        e instanceof Api_Error ? e.message : "Could not update user profile.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  //disables the save button until something's actually changed
  const has_changes =
    firstName !== (user?.first_name ?? "") ||
    lastName !== (user?.last_name ?? "") ||
    email !== (user?.email ?? "");

  // resets the success message whenever the user edits a field
  const handle_field_changes =
    (setter: (value: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSuccess(false);
      setter(e.target.value);
    };

  return (
    <div className="pt-4 flex flex-col gap-5 max-w-md m-auto">
      <h2 className="text-xl font-medium text-green-900">My Profile</h2>

      <form
        onSubmit={handle_submit}
        className="bg-surface-light rounded-md p-4 flex flex-col gap-3"
      >
        <div>
          <label className="block text-xs text-green-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={handle_field_changes(setFirstName)}
            required
            className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-green-700 mb-1">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={handle_field_changes(setLastName)}
            required
            className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-green-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={handle_field_changes(setEmail)}
            required
            className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-green-700 mb-1">Role</label>
          <input
            type="text"
            value={user?.role ? format_label(user.role) : ""}
            disabled
            className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm bg-white text-placeholder-text capitalize"
          />
        </div>
        <div>
          <label className="block text-xs text-green-700 mb-1">
            Organisation
          </label>
          <input
            type="text"
            value={user?.organisation_name}
            disabled
            className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm bg-white text-placeholder-text"
          />
        </div>
        {error && <p className="text-sm text-status-danger-text">{error}</p>}
        {success && (
          <p className="text-sm text-status-success-text">Profile updated.</p>
        )}

        <button
          type="submit"
          disabled={submitting || !has_changes}
          className="self-end px-4 py-1.5 text-sm font-medium rounded-md bg-green-700 text-white disabled:opacity-60 cursor-pointer hover:bg-green-300"
        >
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
