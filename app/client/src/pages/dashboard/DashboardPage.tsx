import { useEffect, useState } from "react";
import { get_queries } from "../../api/queries";
import type { Query, QueryStatus } from "../../types/query.types";
import QueryCard from "../../components/ui/QueryCard";
import { Link } from "react-router-dom";

type Filter = "all" | QueryStatus;
type Sort = "date" | "priority";
const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }; //highest priority first

const DashboardPage = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [sortBy, setSortBy] = useState<Sort>("date");

  useEffect(() => {
    const fetch_queries = async () => {
      setLoading(true);
      setError(null);

      try {
        const { queries } = await get_queries({ limit: 200 });
        setQueries(queries.filter((query) => query.status !== "resolved"));
      } catch {
        setError("Could not load queries. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetch_queries();
  }, []);

  //counts of each status which feeds the filter button badges
  const counts = {
    all: queries.length,
    new: queries.filter((query) => query.status === "new").length,
    in_progress: queries.filter((query) => query.status === "in_progress")
      .length,
    escalated: queries.filter((query) => query.status === "escalated").length,
  };

  //need to filter by the selected status
  const filtered_queries = (
    activeFilter === "all"
      ? queries
      : queries.filter((query) => query.status === activeFilter)
  )
    .slice()
    .sort((a, b) => {
      if (sortBy === "priority")
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  const filter_buttons: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "new", label: "New", count: counts.new },
    { key: "in_progress", label: "In progress", count: counts.in_progress },
    { key: "escalated", label: "Escalated", count: counts.escalated },
  ];

  return (
    <div className="flex flex-col gap-5 pt-3 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-green-700">Dashboard</h2>
        <Link
          to="/new-query"
          className="text-sm text-white border border-surface-mid bg-green-700 px-3 py-1 rounded-md hover:bg-green-300"
        >
          Add New Query
        </Link>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {filter_buttons.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`cursor-pointer px-3.5 py-1.5 rounded-md text-sm hover:bg-green-50 ${
                activeFilter === key
                  ? "bg-green-500 text-white"
                  : "bg-surface-light text-green-700 border border-surface-mid"
              }`}
            >
              {label} - {count}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as Sort)}
          className="rounded-md border border-surface-mid px-2 py-1.5 text-sm cursor-pointer"
        >
          <option value="date">Sort: Newest first</option>
          <option value="priority">Sort: Priority</option>
        </select>
      </div>

      {loading && (
        <p className="text-sm text-placeholder-text">Loading queries...</p>
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
