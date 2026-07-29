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
} from "../../components/ui/BadgeHelper";

//for mapping
const STATUSES: QueryStatus[] = [
  "new",
  "in_progress",
  "awaiting_response",
  "escalated",
  "resolved",
];

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

  return (
    <div className="flex flex-col gap-4 pt-4 max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-base font-medium">
            {query.subject} <span>- Ref: {query.ref_number}</span>
          </div>
          <div>
            {query.sender_org_name}
            <span aria-hidden="true">&harr;</span>
            {query.recipient_org_name}
          </div>
        </div>
        <div>
          <Badge
            label={priority_label[query.priority]}
            variant={priority_variant[query.priority]}
          />
          <Badge
            label={status_label[query.status]}
            variant={status_variant[query.status]}
          />
          <button onClick={() => navigate("/queries")}>Back</button>
        </div>
      </div>

      <div>
        {replies.map((reply) => {
          const own_org_message = reply.sender_org_id === user?.organisation_id;
          return (
            <div
              key={reply.id}
              className={`max-w-[80%] ${own_org_message ? "self-end" : "self-start"}`}
            >
              <div
                className={`rounded-md px-3.5 py-2.5 text-sm ${
                  reply.is_internal
                    ? "bg-status-warning-bg border border-status-warning-text/30"
                    : own_org_message
                      ? "bg-green-500 text-white"
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
          );
        })}
      </div>

      <form onSubmit={handle_reply_submit}>
        <textarea
          value={replyBody}
          onChange={(e) => setReplyBody(e.target.value)}
          placeholder="Enter a reply..."
        ></textarea>
        <div>
          <label>
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
            />
            Internal Note
            <span className="text-xs text-placeholder-text">
              (only visible to your organisation)
            </span>
          </label>
          <button type="submit" disabled={sending || !replyBody.trim()}>
            {sending ? "Sending..." : "Send Reply"}
          </button>
        </div>
      </form>

      {actionError && (
        <p className="text-sm text-status-danger-text">{actionError}</p>
      )}

      <div>
        <div>
          <div>
            <label>Status</label>
            <select
              value={statusVal}
              onChange={(e) => setStatusVal(e.target.value as QueryStatus)}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status_label[status]}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handle_status_change}
            disabled={updatingStatus || statusVal === query.status}
          >
            {updatingStatus ? "Updating..." : "Update Status"}
          </button>
        </div>
        {statusVal === "resolved" && (
          <div>
            <label>Resolution Note (optional)</label>
            <input
              type="text"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
            />
          </div>
        )}

        <div>
          <div>
            <label>Asssign to</label>
            <select
              value={assigneeId}
              onChange={(e) =>
                setAssigneeId(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">Select a staff member</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.first_name} {member.last_name}
                </option>
              ))}
            </select>
          </div>
          <label>
            <input
              type="checkbox"
              checked={escalate}
              onChange={(e) => setEscalate(e.target.checked)}
            />
            Escalate
          </label>
          <button onClick={handle_assignment} disabled={assigning}>
            {assigning ? "Assigning" : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueryThreadPage;
