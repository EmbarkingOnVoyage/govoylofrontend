import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  BookingConfirmedWeb,
  FlightPaymentPageWeb,
  FlightReviewPageWeb,
  clearBookingSession,
  encodeFlightSearch,
  useBookingSession,
  type BookingConfirmation,
  type FlightBookingSelection,
} from "@workspace/ui";

// /flights/review: traveller details for the flights picked on the results
// page (kept in the "flights" booking session, so a refresh keeps them).
export const FlightReviewRoute: React.FC = () => {
  const navigate = useNavigate();
  const [selection, setSelection] = useBookingSession<FlightBookingSelection>("flights");

  if (!selection) return <Navigate to="/" replace />;

  return (
    <FlightReviewPageWeb
      selection={selection}
      onBackToResults={() => navigate(`/flights/results?${encodeFlightSearch(selection.summary)}`)}
      onContinue={(checkout) => {
        setSelection({ ...selection, checkout });
        navigate("/flights/payment");
        window.scrollTo(0, 0);
      }}
    />
  );
};

// /flights/payment: review and pay; needs the traveller details step first.
export const FlightPaymentRoute: React.FC = () => {
  const navigate = useNavigate();
  const [selection] = useBookingSession<FlightBookingSelection>("flights");

  if (!selection) return <Navigate to="/" replace />;
  if (!selection.checkout) return <Navigate to="/flights/review" replace />;

  return (
    <FlightPaymentPageWeb
      selection={selection}
      checkout={selection.checkout}
      onEditTravellers={() => navigate("/flights/review")}
      onBooked={(confirmation) => {
        clearBookingSession("flights");
        navigate("/flights/booked", { replace: true, state: confirmation });
        window.scrollTo(0, 0);
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
      onViewBooking={() => navigate("/my-trips")}
      onBackToHome={() => navigate("/")}
    />
  );
};
