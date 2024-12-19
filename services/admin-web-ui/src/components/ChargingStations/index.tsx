import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { ChargingStation } from "./interfaces";
import { calculateCentroid } from "../Calculations";
import chargingIcon from "/src/assets/charging-station-blue.png";

const ShowChargingStations: React.FC<{ stations: ChargingStation[] }> = ({ stations }) => {
  const map = useMap();

  useEffect(() => {
    if (stations.length > 0) {
      stations.forEach((stations) => {
        const center = calculateCentroid(stations.area);
        
        const chargingStationMarker = L.marker(center, {
          icon: L.icon({
            iconUrl: chargingIcon,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [1, -20],
          }),
        });

        chargingStationMarker.bindPopup(stations.charging_id);
        chargingStationMarker.addTo(map);
      });
    }
  }, [stations, map]);

  return null;
};

export default ShowChargingStations;
