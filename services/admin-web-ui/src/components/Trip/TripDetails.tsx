import React, { useState } from "react";
import { TripDetailsProps } from "./interfaces";
import TripMap from "./TripMap";

const TripDetails: React.FC<TripDetailsProps> = ({ data }) => {
  const [distance, setDistance] = useState<number | null>(null);
  const totalSeconds = (data.end_time.getTime() - data.start_time.getTime()) / 1000;
  const totalMinutes =  totalSeconds / 60;
  const averageSpeed = distance !== null && totalSeconds > 0 
    ? (distance / 1000) / (totalSeconds / 3600) : null;
  
  return (
    <div className="trip-details-map">
      <div className="trip-details">
        <span>Date: {data.start_time.toLocaleString().split(" ")[0]}</span>
        <span>Start location: [{data.start_location.join(", ")}]</span>
        <span>End location: [{data.end_location.join(", ")}]</span>
        <span>Start time: {data.start_time.toLocaleString().split(" ")[1]}</span>
        <span>End time: {data.end_time.toLocaleString().split(" ")[1]}</span>
        <span>Total time: {totalMinutes.toFixed()} min {totalSeconds % 60} sec</span>
        {distance !== null && (
          <span>Total distance: {(distance / 1000).toFixed(2)} km</span>
        )}
        {averageSpeed !== null && (
          <span>Average speed: {averageSpeed.toFixed(2)} km/h</span>
        )}
      </div>
        <TripMap
        startLocation={data.start_location}
        endLocation={data.end_location}
        FetchedDistance={setDistance}
        />
    </div>
  );
};

export default TripDetails;
