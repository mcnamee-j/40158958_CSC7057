import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get_queries } from "../../api/queries";
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

  const find_queries = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await get_queries({
        status: activeFilter === "all" ? undefined : activeFilter,
        search: search || undefined,
        category: category || undefined,
        priority: priority || undefined,
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
    setActiveFilter("all");
  };

  const filter_buttons: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "new", label: "New" },
    { key: "in_progress", label: "In progress" },
    { key: "resolved", label: "Resolved" },
  ];

  return (
    <div>
      <div>
        <h2>Queries</h2>
        <Link to="/new-query">New Query</Link>
      </div>

      <form onSubmit={handle_search_submit}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by subject or reference number"
        />
        <details>
          <summary>Advanced Filters</summary>
          <div>
            <div>
              <label>Category</label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as QueryCategory | "")
                }
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
              <label>Priority</label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as QueryPriority | "")
                }
              >
                <option value="">Any</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <p>Filtering by patient, GP surgery and date goes here</p>
        </details>

        <div>
          {filter_buttons.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div>
          <button type="button" onClick={handle_clear}>
            Clear
          </button>
          <button type="submit">Search</button>
        </div>
      </form>

      {loading && (
        <p className="text-sm text-placeholder-text">Loading queries...</p>
      )}
      {error && <p className="text-sm text-status-danger-text">{error}</p>}

      {!loading && !error && (
        <>
          <p>
            {total} result{total !== 1 ? "s" : ""}
          </p>
          {queries.length === 0 ? (
            <p>No queries match these search conditions</p>
          ) : (
            <div>
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
