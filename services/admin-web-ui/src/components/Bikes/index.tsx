import React from "react";
import { Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import { Bike } from "./interfaces";
import scooterIcon from "/src/assets/scooter-pin-blue.png";
import clusterIcon from "/src/assets/multiple-scooter-pin-blue.png"; // byt mot en cluster icon

const ShowBikes: React.FC<{ bikes: Bike[] }> = ({ bikes }) => {
  const bikeMarker = L.icon({
    iconUrl: scooterIcon,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [0, -40],
  });

  const createClusterMarker = () => {
    return L.icon({
      iconUrl: clusterIcon,
      iconSize: [50, 50],
      iconAnchor: [25, 50],
      popupAnchor: [0, -40],

    });
  };

  return (
    <MarkerClusterGroup
      iconCreateFunction={() => createClusterMarker()}
    >
      {bikes.map((bike) => (
        <Marker
          key={bike.bike_id}
          position={bike.location}
          icon={bikeMarker}
        >
          <Popup>
            <strong>{bike.bike_id}</strong><br />
            {bike.status.available ? "" : `<strong>Speed:</strong> ${bike.speed} km/h<br />`}
            <strong>Battery:</strong> {bike.status.battery_level}%<br />
            <strong>Status:</strong> {bike.status.available ? "Available" : "In use"}
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
};

export default ShowBikes;
