import React, { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { decodeFlightSearch, useFlightSearchQuery } from "@workspace/ui";

// /flights/results?<search>: the search lives in the URL (see
// flightSearchParams), so a refresh or a shared link re-runs it. A search
// started from the form arrives with its result already cached.
export const FlightResultsRoute: React.FC = () => {
  const { search } = useLocation();
  const summary = useMemo(() => decodeFlightSearch(search), [search]);
  const { data, isPending, error } = useFlightSearchQuery(summary?.request ?? null);

  if (!summary) return <Navigate to="/" replace />;

  const route = summary.request.segments.map((segment) => `${segment.origin} → ${segment.destination}`).join(" · ");

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 text-[#182339]">
      <h1 className="text-xl font-semibold mb-1">{route}</h1>
      <p className="text-sm text-[#4C5973] mb-4">
        {summary.departureDate.slice(0, 10)}
        {summary.returnDate ? ` – ${summary.returnDate.slice(0, 10)}` : ""} · {summary.passengerCount} traveller
        {summary.passengerCount > 1 ? "s" : ""}
      </p>
      {isPending && <p>Searching flights…</p>}
      {error && <p className="text-[#C8102E]">{error.message}</p>}
      {data && <p>{data.offers.length} flight(s) found. Results page not built yet.</p>}
    </div>
  );
};
