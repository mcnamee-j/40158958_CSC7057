import { Link } from "react-router-dom";
import type { Query } from "../../types/query.types";
import Badge from "./Badge";
import {
  priority_variant,
  priority_label,
  status_variant,
  status_label,
} from "./BadgeHelper";

//formatting badges
// - borders
const priority_border: Record<Query["priority"], string> = {
  high: "border-1-status-danger-text",
  medium: "border-1-status-warning-text",
  low: "border-1-status-success-text",
};

//-time indicator goes here (elapsed seconds) - needs formatted
const time_elapsed_format = (seconds?: number): string => {
  if (seconds === undefined) return "";

  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const QueryCard = ({ query }: { query: Query }) => {
  return (
    <Link
      to={`/queries/$query.id`}
      className={`flex items-center justify-between bg-surface-light rounded-md border border-surface-mid border-1-4 px-4 py-3 hover:bg-green-50 transition-colors ${priority_border[query.priority]}`}
    >
      <div>
        <div className="text-sm font-medium">
          {query.subject}
          <span className="text-placeholder-text font-normal">
            - Ref: {query.ref_number}
          </span>
        </div>
        <div className="text-sm font-normal">
          {(query.created_by_first_name || query.recipient_org_name) && (
            <div className="text-sm font-normal">
              {query.created_by_first_name} {query.created_by_last_name}
              {query.created_by_first_name &&
                (query.sender_org_name || query.recipient_org_name) &&
                " - "}
              {query.sender_org_name}
            </div>
          )}
        </div>
        <div className="text-xs text-placeholder-text mt-0.5">
          {time_elapsed_format(query.elapsed_seconds)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge
          label={priority_label[query.priority]}
          variant={priority_variant[query.priority]}
        />
        <Badge
          label={status_label[query.status]}
          variant={status_variant[query.status]}
        />
      </div>
    </Link>
  );
};

export default QueryCard;
