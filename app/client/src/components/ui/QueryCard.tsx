import { Link } from "react-router-dom";
import type { Query } from "../../types/query.types";
import Badge from "./Badge";
import {
  priority_variant,
  priority_label,
  status_variant,
  status_label,
  is_old,
} from "./BadgeHelper";
import { AlertTriangle } from "lucide-react";
import { time_elapsed_format } from "./formatElapsed";

//formatting badges
// - borders
const priority_border: Record<Query["priority"], string> = {
  high: "border-1-status-danger-text",
  medium: "border-1-status-warning-text",
  low: "border-1-status-success-text",
};

const QueryCard = ({ query }: { query: Query }) => {
  const old = is_old(query.status, query.elapsed_seconds);

  return (
    <Link
      to={`/queries/${query.id}`}
      className={`flex items-center justify-between bg-surface-light rounded-md border border-surface-mid border-1-4 px-4 py-3 hover:bg-green-50 transition-colors ${priority_border[query.priority]}`}
    >
      <div>
        <div className="text-sm text-green-900 font-medium">
          {query.subject}
        </div>
        <div className="text-placeholder-text text-sm">
          Ref: {query.ref_number}
        </div>

        {(query.created_by_first_name || query.recipient_org_name) && (
          <div className="text-sm font-normal text-green-700">
            {query.created_by_first_name} {query.created_by_last_name}
            {query.created_by_first_name &&
              (query.sender_org_name || query.recipient_org_name) &&
              " - "}
            {query.sender_org_name}
          </div>
        )}

        <div className="text-xs text-placeholder-text mt-0.5 flex items-center gap-1">
          {time_elapsed_format(query.elapsed_seconds)}
          {old && (
            <span className="flex items-center gap-1 text-status-danger-text font-medium">
              <AlertTriangle size={12} />
              Unactioned for over a day
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
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
