import { useEffect, useState } from "react";
import {
  list_staff,
  create_staff,
  deactivate_staff,
  type Staff_Member,
  reset_staff_password,
  reactivate_staff,
} from "../../api/staff";
import { list_organisations, type Organisation } from "../../api/admin";
import { useAuth } from "../../hooks/useAuth";
import { format_label } from "../../utils/format";
import { Api_Error } from "../../api/client";

const ROLE_OPTIONS: Record<string, string[]> = {
  pharmacy: ["pharmacy_staff", "pharmacy_manager"],
  gp_surgery: ["practice_staff", "practice_manager"],
};

const StaffPage = () => {
  const { user } = useAuth();

  const [staff, setStaff] = useState<Staff_Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [inviteSent, setInviteSent] = useState(false);
  const [resetSentId, setResetSentId] = useState<number | null>(null);
  const [orgs, setOrgs] = useState<Organisation[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<number | "">("");

  const is_admin = user?.role === "admin";

  useEffect(() => {
    if (!is_admin) return;
    list_organisations()
      .then(setOrgs)
      .catch(() => setOrgs([]));
  }, [is_admin]);

  // organisation type isn't stored on the auth user object, so it must be
  // derived here: admins pick an org from the dropdown (org_type comes from
  // that selection), while non-admin managers belong to exactly one org type,
  // which is inferred from their own role prefix (e.g. "pharmacy_manager" -> pharmacy)
  const target_org_id = is_admin ? selectedOrgId || undefined : undefined;
  const selected_org = orgs.find((org) => org.id === selectedOrgId);

  const org_type = is_admin
    ? selected_org?.type
    : user?.role.startsWith("pharmacy")
      ? "pharmacy"
      : "gp_surgery";
  const role_options = org_type ? ROLE_OPTIONS[org_type] : [];

  const get_staff = async () => {
    if (is_admin && !selectedOrgId) return;
    setLoading(true);
    setError(null);
    try {
      setStaff(await list_staff(target_org_id));
    } catch {
      setError("Could not load staff.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    get_staff();
  }, [selectedOrgId]);

  const handle_submit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setInviteSent(false);
    if (!role) {
      setFormError("Select a role.");
      return;
    }
    setSubmitting(true);
    try {
      await create_staff({
        first_name: firstName,
        last_name: lastName,
        email,
        role,
      });
      setFirstName("");
      setLastName("");
      setEmail("");
      setRole("");
      setInviteSent(true);
      await get_staff();
    } catch (e) {
      setFormError(
        e instanceof Api_Error ? e.message : "Could not add staff member.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handle_deactivate = async (member: Staff_Member) => {
    if (
      !confirm(
        `Deactivate ${member.first_name} ${member.last_name}? This means that the selected staff member will no longer be able to login.`,
      )
    )
      return;
    try {
      await deactivate_staff(member.id, target_org_id);
      await get_staff();
    } catch (e) {
      setError(
        e instanceof Api_Error
          ? e.message
          : "Could not deactivate staff member.",
      );
    }
  };

  const handle_reset_password = async (member: Staff_Member) => {
    if (
      !confirm(
        `Send a password reset link to ${member.first_name} ${member.last_name}?`,
      )
    )
      return;
    try {
      await reset_staff_password(member.id);
      setResetSentId(member.id);
      // auto-clears the "Link sent" confirmation after 3s so it doesn't
      // linger indefinitely next to the staff member's row
      setTimeout(() => setResetSentId(null), 3000);
    } catch {
      setError("Could not send a reset link at this time.");
    }
  };

  const handle_reactivate = async (member: Staff_Member) => {
    try {
      await reactivate_staff(member.id, target_org_id);
      await get_staff();
    } catch {
      setError("Could not reactivate staff member.");
    }
  };

  return (
    <div className="pt-4 flex flex-col gap-5 max-w-2xl m-auto">
      <h2 className="text-xl font-medium text-green-900">Staff</h2>

      {is_admin && (
        <div>
          <label>Organisation</label>
          <select
            id="organisation_select"
            value={selectedOrgId}
            onChange={(e) =>
              setSelectedOrgId(e.target.value ? Number(e.target.value) : "")
            }
            className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
          >
            <option value="">Select an organisation</option>
            {orgs.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {is_admin && !selectedOrgId ? (
        <p className="text-sm text-placeholder-text">
          Select an organisation to manage its staff
        </p>
      ) : (
        <>
          <form
            onSubmit={handle_submit}
            className="bg-surface-light rounded-md p-4 flex flex-col gap-3"
          >
            <div className="text-sm font-medium text-green-900">
              Invite a new staff member
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-green-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-green-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-green-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-green-700 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
                >
                  <option value="">Select a role</option>
                  {role_options.map((role) => (
                    <option key={role} value={role}>
                      {format_label(role)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {formError && (
              <p className="text-sm text-status-danger-text">{formError}</p>
            )}
            {inviteSent && (
              <p className="text-sm text-status-success-text">
                Invitation sent.
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="self-end px-4 py-1.5 text-sm font-medium rounded-md bg-green-700 text-white disabled:opacity-60 cursor-pointer hover:bg-green-300"
            >
              {submitting ? "Sending" : "Send Invitation"}
            </button>
          </form>

          {loading && (
            <p className="text-sm text-placeholder-text">Loading...</p>
          )}
          {error && <p className="text-sm text-status-danger-text">{error}</p>}
          {!loading && !error && (
            <div className="flex flex-col gap-2">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="flex justify-between items-center bg-surface-light rounded-md px-4 py-2.5 text-sm"
                >
                  <div>
                    <div className="font-medium">
                      {member.first_name} {member.last_name}
                    </div>
                    <div className="text-xs text-placeholder-text">
                      {member.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs capitalize ${member.active ? "text-green-700" : "text-status-danger-text"}`}
                    >
                      {member.active ? format_label(member.role) : "Inactive"}
                    </span>
                    {member.active && member.id !== user?.user_id && (
                      <div className="flex items-center gap-3">
                        {resetSentId === member.id ? (
                          <span className="text-xs text-status-success-text">
                            Link sent
                          </span>
                        ) : (
                          <button
                            onClick={() => handle_reset_password(member)}
                            className="text-xs text-green-700 hover:underline cursor-pointer"
                          >
                            Reset Password
                          </button>
                        )}
                        <button
                          onClick={() => handle_deactivate(member)}
                          className="text-xs text-status-danger-text hover:underline cursor-pointer"
                        >
                          Deactivate
                        </button>
                      </div>
                    )}
                    {!member.active && (
                      <button
                        onClick={() => handle_reactivate(member)}
                        className="text-xs text-status-success-text hover:underline cursor-pointer"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StaffPage;
