import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "./index.css";
import { ParkingZone, MapProps } from "./interfaces";
import parkingIcon from "/src/assets/parking-spot.png";

const ShowParkingZones: React.FC<{ zones: ParkingZone[] }> = ({ zones }) => {
  const map = useMap();

  // justera kartvy beroende på vald stad
  // så att alla zoner syns i vyn
  useEffect(() => {
    if (zones.length > 0) {
      const bounds = L.latLngBounds(zones.flatMap((zone) => zone.area));
      map.fitBounds(bounds, {
        padding: [50, 50],
      });
    }
  }, [zones, map]);

  return null;
};

// ta fram polygonens geometriska centrum
const calculateCentroid = (area: [number, number][]): [number, number] => {
  let x = 0;
  let y = 0;
  let n = area.length;

  for (let i = 0; i < n; i++) {
    x += area[i][0];
    y += area[i][1];
  }

  return [x / n, y / n];
};

const AddBikeMap: React.FC<MapProps> = ({ availableZones, handleMarkerClick }) => {
  const parkingZoneMarker = L.icon({
		iconUrl: parkingIcon,
		iconSize: [30, 30],
		iconAnchor: [15, 30],
		popupAnchor: [1, -20],
	});

  return (
    <div className="add-bike-map">
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
              key={zone._id}
              icon={parkingZoneMarker}
              position={center}
              eventHandlers={{ click: () => handleMarkerClick(zone._id) }}
            >
              <Popup>{zone._id}</Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
    );
};

export default AddBikeMap;