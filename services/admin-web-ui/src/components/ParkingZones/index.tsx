import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { ParkingZone } from "./interfaces";
import { calculateCentroid } from "../Calculations";
import parkingIcon from "/src/assets/parking-spot-blue.png";

const ShowParkingZones: React.FC<{ zones: ParkingZone[] }> = ({ zones }) => {
  const map = useMap();

  useEffect(() => {
    if (zones.length > 0) {
      zones.forEach((zone) => {
        const center = calculateCentroid(zone.area);
        
        const parkingZoneMarker = L.marker(center, {
          icon: L.icon({
            iconUrl: parkingIcon,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [1, -20],
          }),
        });

        parkingZoneMarker.bindPopup(zone.parking_id);
        parkingZoneMarker.addTo(map);
      });
    }
  }, [zones, map]);

  return null;
};

export default ShowParkingZones;
