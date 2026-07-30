import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get_queries } from "../../api/queries";
import {
  get_linked_orgs,
  type LinkedOrganisation,
} from "../../api/organisations";
import type {
  Query,
  QueryCategory,
  QueryPriority,
  QueryStatus,
} from "../../types/query.types";
import QueryCard from "../../components/ui/QueryCard";

type Filter = "all" | QueryStatus;

const QueriesPage = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<QueryCategory | "">("");
  const [priority, setPriority] = useState<QueryPriority | "">("");
  const [patientInitials, setPatientInitials] = useState("");
  const [patientDob, setPatientDob] = useState("");
  const [patientHcn, setPatientHcn] = useState("");
  const [orgId, setOrgId] = useState<number | "">("");
  const [date, setDate] = useState("");

  const [linkedOrgs, setLinkedOrgs] = useState<LinkedOrganisation[]>([]);

  useEffect(() => {
    get_linked_orgs()
      .then(setLinkedOrgs)
      .catch(() => setLinkedOrgs([]));
  }, []);

  const find_queries = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await get_queries({
        status: activeFilter === "all" ? undefined : activeFilter,
        search: search || undefined,
        category: category || undefined,
        priority: priority || undefined,
        patient_initials: patientInitials || undefined,
        patient_dob: patientDob || undefined,
        patient_hcn: patientHcn || undefined,
        org_id: orgId || undefined,
        date: date || undefined,
        limit: 50,
      });
      setQueries(result.queries);
      setTotal(result.total);
    } catch {
      setError("Could not load queries. Please try again");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern, currently being overflagged on version of eslint (ongoing issue)
    find_queries();
  }, [activeFilter]);

  const handle_search_submit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    find_queries();
  };

  const handle_clear = () => {
    setSearch("");
    setCategory("");
    setPriority("");
    setPatientInitials("");
    setPatientDob("");
    setPatientHcn("");
    setOrgId("");
    setDate("");
    setActiveFilter("all");
  };

  const filter_buttons: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "new", label: "New" },
    { key: "in_progress", label: "In progress" },
    { key: "resolved", label: "Resolved" },
  ];

  return (
    <div className="flex flex-col gap-5 pt-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-green-700">Queries</h2>
        <Link
          to="/new-query"
          className="bg-green-700 text-white text-sm font-medium px-4 py-1.5 rounded-md"
        >
          New Query
        </Link>
      </div>

      <form onSubmit={handle_search_submit} className="flex flex-col gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by subject or reference number"
          className="w-full rounded-md border border-surface-mid text-sm px-3 py-2"
        />
        <details className="bg-surface-light rounded-md px-4 py-3">
          <summary className="text-sm font-medium text-green-900 cursor-pointer">
            Advanced Filters
          </summary>

          <div className="mt-3">
            <label className="block text-sm text-green-700 mb-1">Patient</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={patientInitials}
                onChange={(e) => setPatientInitials(e.target.value)}
                placeholder="Initials"
                className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
              />
              <input
                type="date"
                value={patientDob}
                onChange={(e) => setPatientDob(e.target.value)}
                className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm text-placeholder-text"
              />
              <input
                type="text"
                value={patientHcn}
                onChange={(e) => setPatientHcn(e.target.value)}
                placeholder="HCN"
                className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-sm text-green-700 mb-1">
                Organisation
              </label>
              <select
                value={orgId}
                onChange={(e) =>
                  setOrgId(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
              >
                <option value="">Any</option>
                {linkedOrgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-green-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as QueryCategory | "")
                }
                className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
              >
                <option value="">Any</option>
                <option value="prescription">Prescription</option>
                <option value="stock">Stock</option>
                <option value="patient">Patient</option>
                <option value="routine">Routine</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-green-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as QueryPriority | "")
                }
                className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
              >
                <option value="">Any</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-green-700 mb-1">
                Date raised
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-surface-mid px-2 py-1.5 text-sm"
              />
            </div>
          </div>
        </details>

        <div className="flex gap-2 flex-wrap justify-center">
          {filter_buttons.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFilter(key)}
              className={`px-3.5 py-1.5 rounded-md text-sm ${
                activeFilter === key
                  ? "bg-green-500 text-white"
                  : "bg-surface-light text-green-700 border border-surface-mid"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handle_clear}
            className="px-4 py-1.5 bg-green-100 text-sm text-green-900 rounded-md border border-surface-mid"
          >
            Clear
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 text-sm rounded-md bg-green-700 text-white font-medium"
          >
            Search
          </button>
        </div>
      </form>

      {loading && (
        <p className="text-sm text-placeholder-text">Loading queries...</p>
      )}
      {error && <p className="text-sm text-status-danger-text">{error}</p>}

      {!loading && !error && (
        <>
          <p className="text-xs text-placeholder-text">
            {total} result{total !== 1 ? "s" : ""}
          </p>
          {queries.length === 0 ? (
            <p className="text-xs text-placeholder-text">
              No queries match these search conditions
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {queries.map((query) => (
                <QueryCard key={query.id} query={query} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QueriesPage;
