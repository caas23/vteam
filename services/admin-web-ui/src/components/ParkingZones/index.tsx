import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { ParkingZone } from "./interfaces";

const ShowParkingZones: React.FC<{ zones: ParkingZone[] }> = ({ zones }) => {
  const map = useMap();

  useEffect(() => {
    if (zones.length > 0) {
      const bounds = L.latLngBounds(zones.flatMap((zone) => zone.area));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [zones, map]);

  return null;
};

export default ShowParkingZones;
