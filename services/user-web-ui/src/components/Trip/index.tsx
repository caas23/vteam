import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./index.css";
import TripDetails from "./TripDetails";
import { Trip as TripInterface } from "./interfaces";
import { fetchOneTrip } from "../../fetchModels/fetchOneTrip";

const Trip: React.FC = () => {
  const { trip } = useParams<{ trip: string }>();
	const [currentTrip, setCurrentTrip] = useState<TripInterface | null>(null);


  useEffect(() => {
    document.title = `Trip ${trip} - Solo Scoot`;

    const fetchAndSetTrip = async () => {
          const result = await fetchOneTrip(trip ? trip : "");
          setCurrentTrip(result[0]);
        };
        fetchAndSetTrip();
  }, [trip]);

  return (
    <div>
      <h1>Trip {trip}</h1>
      {currentTrip ? (
        <TripDetails data={currentTrip} />
      ) : (
        <p>No data related to trip <i>{trip}</i> was found.</p>
      )}
    </div>
  );
};

export default Trip;
