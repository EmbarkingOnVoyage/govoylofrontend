import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  BookingConfirmedWeb,
  FlightReviewPageWeb,
  clearBookingSession,
  encodeFlightSearch,
  useBookingSession,
  type BookingConfirmation,
  type FlightBookingSelection,
} from "@workspace/ui";

// /flights/review: traveller details + payment for the flights picked on the
// results page (kept in the "flights" booking session, so a refresh keeps them).
export const FlightReviewRoute: React.FC = () => {
  const navigate = useNavigate();
  const [selection] = useBookingSession<FlightBookingSelection>("flights");

  if (!selection) return <Navigate to="/" replace />;

  return (
    <FlightReviewPageWeb
      selection={selection}
      onBackToResults={() => navigate(`/flights/results?${encodeFlightSearch(selection.summary)}`)}
      onBooked={(confirmation) => {
        clearBookingSession("flights");
        navigate("/flights/booked", { replace: true, state: confirmation });
      }}
    />
  );
};

// /flights/booked: shown once after payment; the booking itself lives in My Trips.
export const BookingConfirmedRoute: React.FC = () => {
  const navigate = useNavigate();
  const confirmation = useLocation().state as BookingConfirmation | null;

  if (!confirmation?.bookingRefNo) return <Navigate to="/my-trips" replace />;

  return (
    <BookingConfirmedWeb
      confirmation={confirmation}
      onViewTrips={() => navigate("/my-trips")}
      onNewSearch={() => navigate("/")}
    />
  );
};
