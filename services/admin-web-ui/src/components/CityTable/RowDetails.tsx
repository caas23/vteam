import React from "react";
import { RowItemProps } from "./interfaces";

const RowDetails: React.FC<RowItemProps> = ({ item }) => {
  /* TODO: Lägg till knapp/möjlighet att uppdatera innehållet i kategorierna */

  /* Area, i stations och parking, kommer troligen behöva justeras när vi får in 
    fler koordinater från db. Kanske genom att visa några och sedan behöver 
    man trycka på någon knapp för att visa fler, eller dölja alla från början och 
    endast visa om man väljer att öppna en dropdown/popup eller dylikt */

  console.log(item)
  // bike
  if ("status" in item) {
    return (
      <div className="city-row">
          <span><strong>Bike #{item._id}</strong></span>
          <span>Status: {item.status.in_service ? "In Service" : item.status.available ? "Available" : "Occupied"}</span>
          <span>Position: [{item.location.join(", ")}]</span>
          <span className="more-details"><a href={`/bike/${item._id}`}>View more details</a></span>
      </div>
    );
  }

  // station
  if ("plugs" in item) {
    return (
      <div className="city-row">
        <span><strong>Station #{item._id}</strong></span>
        <span>
          Area:
            {item.area.map((coordinatePair, index) => (
              <pre key={index}>
                <span className="spacing">{index === 0 ? "[" : ""}</span>[{coordinatePair.join(", ")}]{index < item.area.length - 1 ? ", " : "]"}
              </pre>
            ))}
        </span>
        <span>Plugs: {item.plugs.length}
          <span className="sub-list">
          {item.plugs.map((plug, index) => (
            <div key={index}>
              <span className="sub-level-arrow">&#8618; </span> 
                Plug #{plug.id}: {plug.available ? "Available" : "Occupied"}
            </div>
          ))}
          </span>
        </span>
      </div>
    );
  }

  // parking
  if ("area" in item && !("plugs" in item)) {
    return (
      <div className="city-row">
        <span><strong>Zone #{item._id}</strong></span>
        <span>
          Area:
            {item.area.map((coordinatePair, index) => (
              <pre key={index}>
                <span className="spacing">{index === 0 ? "[" : ""}</span>[{coordinatePair.join(", ")}]{index < item.area.length - 1 ? ", " : "]"}
              </pre>
            ))}
        </span>
      </div>
    );
  }

  // rules
  if ("description" in item) {
    return (
      <div className="city-row">
        <span><strong>Rule #{item._id}</strong></span>
        <span>Description: {item.description}</span>
      </div>
    );
  }

  return;
};

export default RowDetails;

