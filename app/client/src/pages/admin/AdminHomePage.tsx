import { useEffect, useState } from "react";
import { get_admin_overview, type Overview } from "../../api/admin";
import { format_label } from "../../utils/format";

const AdminHomePage = () => {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const get_overview = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await get_admin_overview();
        setOverview(data);
      } catch {
        setError("Could not load overview");
      } finally {
        setLoading(false);
      }
    };

    get_overview();
  }, []);

  if (loading)
    return <p className="text-sm text-placeholder-text pt-4">Loading...</p>;
  if (error || !overview) {
    return (
      <p className="text-sm text-status-danger-text pt-4">
        {error ?? "No data available."}
      </p>
    );
  }

  const total_orgs = overview.organisations
    .filter((org) => org.type !== "system")
    .reduce((sum, organisation) => sum + Number(organisation.count), 0);

  const total_users = overview.users
    .filter((user) => user.role !== "admin")
    .reduce((sum, user) => sum + Number(user.count), 0);

  const total_queries = overview.queries.reduce(
    (sum, query) => sum + Number(query.count),
    0,
  );

  return (
    <div className="pt-4 flex flex-col gap-6 max-w-3xl m-auto">
      <h2 className="text-xl font-medium text-green-900">System Overview</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-light rounded-md p-4">
          <div className="text-xs text-green-700">Organisations</div>
          <div className="text-2xl font-medium">{total_orgs}</div>
        </div>
        <div className="bg-surface-light rounded-md p-4">
          <div className="text-xs text-green-700">Active Users</div>
          <div className="text-2xl font-medium">{total_users}</div>
        </div>
        <div className="bg-surface-light rounded-md p-4">
          <div className="text-xs text-green-700">Total Queries</div>
          <div className="text-2xl font-medium">{total_queries}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-light rounded-md p-4">
          <div className="text-sm font-medium text-green-900 mb-2">
            Organisations by type
          </div>
          <div className="flex flex-col gap-1 text-sm">
            {overview.organisations.map((org) => (
              <div key={org.type} className="flex justify-between">
                <span>{format_label(org.type)}</span>
                <span className="font-medium">{org.count}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-surface-mid pt-1 mt-1 text-xs text-placeholder-text">
              <span>Linked Organisation Pairs</span>
              <span className="font-medium">{overview.organisation_links}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-light rounded-md p-4">
          <div className="text-sm font-medium text-green-900 mb-2">
            Users by role
          </div>
          <div className="flex flex-col gap-1 text-sm">
            {overview.users.map((user) => (
              <div key={user.role} className="flex justify-between">
                <span>{format_label(user.role)}</span>
                <span className="font-medium">{user.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-light rounded-md p-4 col-span-2">
          <div className="text-sm font-medium text-green-900 mb-2">
            Queries by status
          </div>
          <div className="grid grid-cols-2 gap-1 text-sm">
            {overview.queries.map((query) => (
              <div key={query.status} className="flex justify-between">
                <span>{format_label(query.status)}</span>
                <span className="font-medium">{query.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
