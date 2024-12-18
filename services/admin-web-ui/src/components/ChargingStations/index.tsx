import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { ChargingStation } from "./interfaces";

const ShowChargingStations: React.FC<{ stations: ChargingStation[] }> = ({ stations }) => {
  const map = useMap();

  useEffect(() => {
    if (stations.length > 0) {
      const bounds = L.latLngBounds(stations.flatMap((stations) => stations.area));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [stations, map]);

  return null;
};

export default ShowChargingStations;
