import React, { useMemo } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  FlightResultsPageWeb,
  decodeFlightSearch,
  encodeFlightSearch,
  useFlightSearchQuery,
  writeBookingSession,
  type FlightBookingSelection,
  type FlightResultsChoice,
} from "@workspace/ui";

// /flights/results?<search>: the search lives in the URL (see
// flightSearchParams), so a refresh or a shared link re-runs it. A search
// started from the form arrives with its result already cached.
export const FlightResultsRoute: React.FC = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const summary = useMemo(() => decodeFlightSearch(search), [search]);
  const { data, isPending, error, refetch } = useFlightSearchQuery(summary?.request ?? null);

  if (!summary) return <Navigate to="/" replace />;

  const handleSelectDate = (iso: string) => {
    const segments = summary.request.segments.map((segment, index) =>
      index === 0 ? { ...segment, travelDate: iso } : segment
    );
    const request = { ...summary.request, segments };
    navigate(`/flights/results?${encodeFlightSearch({ ...summary, request, departureDate: iso })}`);
  };

  const handleChoose = (choice: FlightResultsChoice) => {
    const selection: FlightBookingSelection = { ...choice, summary, selectedAt: new Date().toISOString() };
    writeBookingSession("flights", selection);
    navigate("/flights/review");
  };

  return (
    <FlightResultsPageWeb
      summary={summary}
      offers={data?.offers ?? []}
      isLoading={isPending}
      error={error}
      onRetry={() => refetch()}
      onSelectDate={handleSelectDate}
      onModifySearch={() => navigate(`/?${encodeFlightSearch(summary)}`)}
      onChoose={handleChoose}
    />
  );
};
