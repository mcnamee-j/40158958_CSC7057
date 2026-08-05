import { useEffect, useState } from "react";
import {
  list_staff,
  create_staff,
  deactivate_staff,
  type Staff_Member,
} from "../../api/staff";
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

  //organisation type not on auth user object - need to decide based on role
  const org_type = user?.role.startsWith("pharmacy")
    ? "pharmacy"
    : "gp_surgery";
  const role_options = ROLE_OPTIONS[org_type];

  const get_staff = async () => {
    setLoading(true);
    setError(null);
    try {
      setStaff(await list_staff());
    } catch {
      setError("Could not load staff.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    get_staff();
  }, []);

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
      await deactivate_staff(member.id);
      await get_staff();
    } catch {
      setError("Could not deactivate staff member.");
    }
  };

  return (
    <div>
      <h2>Staff</h2>

      <form onSubmit={handle_submit}>
        <div>Invite a new staff member</div>
        <div>
          <div>
            <label htmlFor="">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
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
          <p className="text-sm text-status-success-text">Invitation sent.</p>
        )}
        <button type="submit" disabled={submitting}>
          {submitting ? "Sending" : "Send Invitation"}
        </button>
      </form>

      {loading && <p className="text-sm text-placeholder-text">Loading...</p>}
      {error && <p className="text-sm text-status-danger-text">{error}</p>}
      {!loading && !error && (
        <div className="flex flex-col gap-2">
          {staff.map((member) => (
            <div>
              <div>
                <div>
                  {member.first_name} {member.last_name}
                </div>
                <div>{member.email}</div>
              </div>
              <div>
                <span>
                  {member.active ? format_label(member.role) : "Inactive"}
                </span>
                {member.active && (
                  <button onClick={() => handle_deactivate(member)}>
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffPage;
