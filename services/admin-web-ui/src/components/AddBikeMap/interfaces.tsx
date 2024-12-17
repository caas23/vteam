interface ParkingZone {
  parking_id: string;
  area: [number, number][];
}

interface FormData {
  cityName: string;
  parkingZone: string;
}

interface MapProps {
  availableZones: ParkingZone[];
  handleMarkerClick: (zoneId: string) => void;
}


export type {
  ParkingZone,
  FormData,
  MapProps
};
