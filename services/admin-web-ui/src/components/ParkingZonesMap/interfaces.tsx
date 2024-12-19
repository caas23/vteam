interface ParkingZone {
  parking_id: string;
  area: [number, number][];
}

interface MapProps {
  availableZones: ParkingZone[];
  handleMarkerClick: (zoneId: string) => void;
  city: string;
}

export type {
  MapProps
};
