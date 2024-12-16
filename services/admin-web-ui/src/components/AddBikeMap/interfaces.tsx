interface ParkingZone {
  _id: string;
  area: [number, number][];
}

// inte fullständigt, har bara lagt in
// de delar som behövts under testning av 
// formuläret för att addera en cykel
interface City {
  _id: string;
  name: string;
  parking_zones: string[];
  bikes: string[];
  charging_stations: string[];
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
  City,
  FormData,
  MapProps
};
