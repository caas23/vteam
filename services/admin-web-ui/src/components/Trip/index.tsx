import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import "./index.css";
import TripDetails from "./TripDetails";
import { tempDataTrips } from "./tempTripData";

const Trip: React.FC = () => {
  const { trip: tripId } = useParams<{ trip: string }>();

  useEffect(() => {
    document.title = `Trip ${tripId} - Avec`;
  }, [tripId]);

  const tripData = tempDataTrips.find((trip) => trip._id === tripId);

  return (
    <div>
      <h1>Trip {tripId}</h1>
      {tripData ? (
        <TripDetails data={tripData} />
      ) : (
        <p>No data related to trip <i>{tripId}</i> was found.</p>
      )}
    </div>
  );
};

export default Trip;
