import React from "react";
import { BikeDetailsProps } from "./interfaces";

const BikeDetails: React.FC<BikeDetailsProps> = ({ data }) => {
  return (
    <div className="bike-details">
      <span>Location: [{data.location.join(", ")}]</span>
      <span>City: {data.city_name}</span>
      <span>Speed: {data.speed}</span>
      <span>Status: {data.status.in_service ? "In Service" : data.status.available ? "Available" : "Occupied"}</span>
      <span>Trips: {data.completed_trips.length}
          <span className="sub-list">
          {data.completed_trips.map((trip, index) => (
            <div key={index}>
              <span className="sub-level-arrow">&#8618; </span> 
                Trip&nbsp;
                <span className="more-details">
                  <a href={`/trip/${trip}`}>#{trip}</a>
                </span>
            </div>
          ))}
          </span>
        </span>
    </div>
  );
};

export default BikeDetails;
