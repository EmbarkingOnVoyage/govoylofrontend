import React, { useMemo } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  FlightResultsPageWeb,
  FlightSearchFormWeb,
  MenuBar,
  decodeFlightSearch,
  encodeFlightSearch,
  flightSearchQueryKey,
  useFlightSearchQuery,
  writeBookingSession,
  type FlightBookingSelection,
  type FlightResultsChoice,
} from "@workspace/ui";

// /flights/results?<search>: the search lives in the URL (see
// flightSearchParams), so a refresh or a shared link re-runs it. A search
// started from a form arrives with its result already cached.
export const FlightResultsRoute: React.FC<{ onNavigate: (rule: string) => void }> = ({ onNavigate }) => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
      header={
        <MenuBar onNavigate={onNavigate}>
          <FlightSearchFormWeb
            variant="bar"
            // Remount when the URL's search changes so the bar shows it.
            key={search}
            initialSummary={summary}
            onNavigate={onNavigate}
            onResults={(response, next) => {
              queryClient.setQueryData(flightSearchQueryKey(next.request), response);
              navigate(`/flights/results?${encodeFlightSearch(next)}`);
            }}
          />
        </MenuBar>
      }
      summary={summary}
      offers={data?.offers ?? []}
      isLoading={isPending}
      error={error}
      onRetry={() => refetch()}
      onSelectDate={handleSelectDate}
      onChoose={handleChoose}
    />
  );
};
