import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MyTripsPageWeb, TripDetailsPageWeb } from "@workspace/ui";

export const MyTripsRoute: React.FC = () => {
  const navigate = useNavigate();
  return <MyTripsPageWeb onOpenTrip={(id) => navigate(`/my-trips/${id}`)} onExploreTrips={() => navigate("/")} />;
};

export const TripDetailsRoute: React.FC = () => {
  const navigate = useNavigate();
  const { tripBookingId = "" } = useParams();
  return <TripDetailsPageWeb tripBookingId={tripBookingId} onBack={() => navigate("/my-trips")} />;
};
