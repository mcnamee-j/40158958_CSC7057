import { useEffect, useState } from "react";
import { get_queries } from "../../api/queries";
import type { Query, QueryStatus } from "../../types/query.types";
import QueryCard from "../../components/ui/QueryCard";

type Filter = "all" | QueryStatus;

const DashboardPage = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>("all");

  useEffect(() => {
    const fetch_queries = async () => {
      setLoading(true);
      setError(null);

      try {
        const { queries } = await get_queries({ limit: 200 });
        setQueries(queries);
      } catch {
        setError("Could not load queries. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetch_queries();
  }, []);

  //counts of each status
  const counts = {
    all: queries.length,
    new: queries.filter((query) => query.status === "new").length,
    in_progress: queries.filter((query) => query.status === "in_progress")
      .length,
    resolved: queries.filter((query) => query.status === "resolved").length,
  };

  //need to filter by the selected status
  const filtered_queries =
    activeFilter === "all"
      ? queries
      : queries.filter((query) => query.status === activeFilter);

  const filter_buttons: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "new", label: "New", count: counts.new },
    { key: "in_progress", label: "In progress", count: counts.in_progress },
    { key: "resolved", label: "Resolved", count: counts.resolved },
  ];

  return (
    <div className="flex flex-col gap-5 pt-3">
      <h2 className="text-xl font-medium text-green-700">Dashboard</h2>
      <div className="flex gap-2 flex-wrap justify-center">
        {filter_buttons.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`px-3.5 py-1.5 rounded-md text-sm ${
              activeFilter === key
                ? "bg-green-500 text-white"
                : "bg-surface-light text-green-700 border border-surface-mid"
            }`}
          >
            {label} - {count}
          </button>
        ))}
      </div>
      {loading && (
        <p className="text-sm text-placeholder-text">Loading queires...</p>
      )}

      {error && <p className="text-sm text-status-danger-text">{error}</p>}

      {!loading && !error && filtered_queries.length === 0 && (
        <p className="text-sm text-placeholder-text">
          No queries match this filter
        </p>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-2.5">
          {filtered_queries.map((query) => (
            <QueryCard key={query.id} query={query} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
