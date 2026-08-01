import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { Query, QueryReply, QueryStatus } from "../../types/query.types";
import { get_org_staff, type OrgStaffMember } from "../../api/organisations";
import {
  add_reply,
  assign_query,
  get_query_by_id,
  update_status,
} from "../../api/queries";
import { Api_Error } from "../../api/client";
import Badge from "../../components/ui/Badge";
import {
  priority_variant,
  priority_label,
  status_variant,
  status_label,
  is_old,
} from "../../components/ui/BadgeHelper";
import { AlertTriangle } from "lucide-react";

const QueryThreadPage = () => {
  //can use params to get id (string)
  const { id } = useParams<{ id: string }>();
  const query_id = Number(id); //API expects number
  const { user } = useAuth();
  const navigate = useNavigate();

  //all use states
  const [query, setQuery] = useState<Query | null>(null);
  const [replies, setReplies] = useState<QueryReply[]>([]);
  const [staff, setStaff] = useState<OrgStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusVal, setStatusVal] = useState<QueryStatus>("new");
  const [replyBody, setReplyBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assigneeId, setAssigneeId] = useState<number | "">("");
  const [escalate, setEscalate] = useState(false);
  const [assigning, setAssigning] = useState(false);

  //get query and thread
  const get_thread = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await get_query_by_id(query_id);
      setQuery(result.query);
      setReplies(result.replies);
      setStatusVal(result.query.status);
    } catch {
      setError("Could not load query.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isInteger(query_id)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    get_thread();
    get_org_staff()
      .then(setStaff)
      .catch(() => setStaff([]));
  }, [query_id]);

  //submit handler
  const handle_reply_submit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setSending(true);
    setActionError(null);
    try {
      await add_reply(query_id, replyBody, isInternal);
      setReplyBody("");
      setIsInternal(false);
    } catch (e) {
      setActionError(
        e instanceof Api_Error
          ? e.message
          : "Could not send reply at this time.",
      );
    } finally {
      setSending(false);
    }
  };

  //status change handler
  const handle_status_change = async () => {
    setUpdatingStatus(true);
    setActionError(null);
    try {
      const updated = await update_status(
        query_id,
        statusVal,
        statusVal === "resolved" ? resolutionNote || undefined : undefined,
      );
      setQuery(updated);
      setResolutionNote("");
    } catch (e) {
      setActionError(
        e instanceof Api_Error
          ? e.message
          : "Could not update status at this time.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  //query assignment handler
  const handle_assignment = async () => {
    if (!assigneeId) {
      setActionError("Select a staff member to assign this query to.");
      return;
    }
    setAssigning(true);
    setActionError(null);
    try {
      const updated = await assign_query(query_id, assigneeId, escalate);
      setQuery(updated);
      setStatusVal(updated.status);
      setEscalate(false);
    } catch (e) {
      setActionError(
        e instanceof Api_Error
          ? e.message
          : "Could not assign query at this time.",
      );
    } finally {
      setAssigning(false);
    }
  };

  if (loading)
    return <p className="text-sm text-placeholder-text pt-4">Loading...</p>;
  if (error || !query) {
    return (
      <div className="pt-4">
        <p className="text-sm text-status-danger-text">
          {error ?? "Query not found."}
        </p>
        <button
          onClick={() => navigate("/queries")}
          className="text-sm text-green-700 mt-2"
        >
          Back to queries
        </button>
      </div>
    );
  }

  //for mapping
  const SELECTABLE_STATUSES: QueryStatus[] = [
    "in_progress",
    "escalated",
    "resolved",
  ];
  const status_options: QueryStatus[] =
    query?.status === "new"
      ? ["new", ...SELECTABLE_STATUSES]
      : SELECTABLE_STATUSES;

  return (
    <div className="flex gap-4 pt-2 max-w-4xl mx-auto">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-base font-medium">
              {query.subject}{" "}
              <span className="text-placeholder-text font-normal text-sm">
                - Ref: {query.ref_number}
              </span>
            </div>
            <div className="text-sm text-green-700 flex items-center gap-1.5 mt-0.5">
              {query.sender_org_name}
              <span aria-hidden="true">&harr;</span>
              {query.recipient_org_name}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge
              label={priority_label[query.priority]}
              variant={priority_variant[query.priority]}
            />
            <Badge
              label={status_label[query.status]}
              variant={status_variant[query.status]}
            />
            <button
              onClick={() => navigate("/queries")}
              className="bg-green-700 text-white px-3 py-1.5 text-sm rounded-md border border-surface-mid cursor-pointer"
            >
              Back
            </button>
          </div>
        </div>
        <div className="flex justify-between">
          {is_old(query.status, query.elapsed_seconds) && (
            <span className="flex gap-1 text-xs text-status-danger-text font-medium">
              <AlertTriangle size={12} />
              Unactioned for over a day
            </span>
          )}
          {query.priority === "high" && (
            <span className="flex gap-1 text-xs text-status-danger-text font-medium">
              <AlertTriangle size={12} />
              Extremely urgent queries should be followed up by phone.
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          {replies.map((reply) => {
            const own_org_message =
              reply.sender_org_id === user?.organisation_id;
            const initials = `${reply.sender_first_name?.[0] ?? ""}${reply.sender_last_name?.[0] ?? ""}`;
            return (
              <div
                key={reply.id}
                className={`max-w-[80%] flex gap-2 ${own_org_message ? "self-end flex-row-reverse" : "self-start"}`}
              >
                <div className="w-7 h-7 rounded-full bg-status-accent-bg text-status-accent-text text-xs font-medium flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="flex flex-col">
                  <div
                    className={`text-xs text-placeholder-text mb-0.5 ${own_org_message ? "text-right" : ""}`}
                  >
                    {reply.sender_first_name} {reply.sender_last_name} -{" "}
                    <span className="capitalize">
                      {reply.sender_role?.replace("_", " ")},{" "}
                    </span>
                    {reply.sender_org_display_name}
                  </div>
                  <div
                    className={`rounded-md px-3.5 py-2.5 text-sm ${
                      reply.is_internal
                        ? "bg-status-warning-bg border border-status-warning-text/30"
                        : own_org_message
                          ? "bg-green-300 text-white"
                          : "bg-surface-light"
                    }`}
                  >
                    {reply.is_internal && (
                      <div className="text-xs font-medium mb-1 opacity-80">
                        Internal Note
                      </div>
                    )}
                    {reply.body}
                  </div>
                  <div
                    className={`text-xs text-placeholder-text mt-0.5 ${own_org_message ? "text-right" : ""}`}
                  >
                    {new Date(reply.sent_at).toLocaleString()}
                    {own_org_message && reply.read_at && " - read"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <form
          onSubmit={handle_reply_submit}
          className="border-t border-surface-mid pt-3 flex flex-col gap-2"
        >
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Enter a reply..."
            className="w-full min-h-16 rounded-md border border-surface-mid px-3 py-2 text-sm"
          ></textarea>
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-1.5 text-sm text-green-700">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="w-auto"
              />
              Internal Note
              <span className="text-xs text-placeholder-text">
                (only visible to your organisation)
              </span>
            </label>
            <button
              type="submit"
              disabled={sending || !replyBody.trim()}
              className="px-4 py-1.5 text-sm font-medium rounded-md bg-green-700 text-white disabled:opacity-60 cursor-pointer"
            >
              {sending ? "Sending..." : "Send Reply"}
            </button>
          </div>
        </form>

        {actionError && (
          <p className="text-sm text-status-danger-text">{actionError}</p>
        )}
      </div>

      <div className="w-56 shrink-0 bg-surface-light rounded-md p-4 flex flex-col gap-3 text-sm h-fit">
        <div>
          <div className="text-xs text-green-700 mb-0.5">Category</div>
          <div className="capitalize">{query.category}</div>
        </div>
        <div>
          <div className="text-xs text-green-700 mb-0.5">Assigned to</div>
          <div>
            {query.assigned_to_first_name
              ? `${query.assigned_to_first_name} ${query.assigned_to_last_name}`
              : "Unassigned"}
          </div>
        </div>
        {query.patient_initials && (
          <div>
            <div className="text-xs text-green-700 mb-0.5">Patient</div>
            <div>{query.patient_initials}</div>
            {query.patient_dob && (
              <div className="text-xs text-placeholder-text">
                DOB: {query.patient_dob.split("T")[0]}
              </div>
            )}
            {query.patient_hcn && (
              <div className="text-xs text-placeholder-text">
                HCN: {query.patient_hcn}
              </div>
            )}
          </div>
        )}
        <div>
          <div className="text-xs text-green-700 mb-0.5">Date Raised</div>
          <div className="text-xs">
            {new Date(query.created_at).toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-xs text-green-700 mb-0.5">Last Updated</div>
          <div className="text-xs">
            {new Date(query.updated_at).toLocaleString()}
          </div>
        </div>

        <div className="border-t border-surface-mid pt-3 flex flex-col gap-3">
          <div className="flex-1">
            <label className="block text-xs text-green-700 mb-1">Status</label>
            <select
              value={statusVal}
              onChange={(e) => setStatusVal(e.target.value as QueryStatus)}
              className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
            >
              {status_options.map((status) => (
                <option key={status} value={status}>
                  {status_label[status]}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handle_status_change}
            disabled={updatingStatus || statusVal === query.status}
            className="w-full px-3 py-1.5 mt-1.5 text-sm bg-green-700 text-white rounded-md disabled:opacity-60 cursor-pointer"
          >
            {updatingStatus ? "Updating..." : "Update Status"}
          </button>
          {statusVal === "resolved" && (
            <div>
              <label className="block text-xs text-green-700 mb-1">
                Resolution Note (optional)
              </label>
              <input
                type="text"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                className="w-ful rounded-md border border-surface-mid px-2 py-1.5 text-sm"
              />
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-surface-mid">
          <label className="block text-xs text-green-700 mb-1">
            Asssign to
          </label>
          <select
            value={assigneeId}
            onChange={(e) =>
              setAssigneeId(e.target.value ? Number(e.target.value) : "")
            }
            className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
          >
            <option value="">Select a staff member</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.first_name} {member.last_name}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-1.5 text-sm text-green-700 mt-1.5">
          <input
            type="checkbox"
            checked={escalate}
            onChange={(e) => setEscalate(e.target.checked)}
            className="w-auto"
          />
          Escalate{" "}
        </label>
        <p className="text-xs text-placeholder-text">
          Tick if escalating query to a manager or prescriber
        </p>
        <button
          onClick={handle_assignment}
          disabled={assigning}
          className="w-full mt-1.5 px-3 py-1.5 text-sm rounded-md bg-green-700 text-white disabled:opacity-60 cursor-pointer"
        >
          {assigning ? "Assigning" : "Assign"}
        </button>
      </div>
    </div>
  );
};

export default QueryThreadPage;
