import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "./index.css";
import ShowParkingZones from "../ParkingZones";
import { MapProps } from "./interfaces";
import parkingIcon from "/src/assets/parking-spot.png";
import { calculateCentroid } from "../Calculations";

const ParkingZonesMap: React.FC<MapProps> = ({ availableZones, handleMarkerClick }) => {
  const parkingZoneMarker = L.icon({
		iconUrl: parkingIcon,
		iconSize: [30, 30],
		iconAnchor: [15, 30],
		popupAnchor: [1, -20],
	});

  return (
    <div className="parking-zones-map">
      <MapContainer
        center={[0, 0]}
        zoom={2}
        style={{ height: "100%"}}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />
        <ShowParkingZones zones={availableZones} />
        {availableZones.map((zone) => {
          const center = calculateCentroid(zone.area);
          return (
            <Marker
              key={zone.parking_id}
              icon={parkingZoneMarker}
              position={center}
              eventHandlers={{ click: () => handleMarkerClick(zone.parking_id) }}
            >
              <Popup>{zone.parking_id}</Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
    );
};

export default ParkingZonesMap;