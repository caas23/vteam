interface FormData {
  name: string;
  display_name: string;
  charging_stations: string[];
  parking_zones: string[];
  rules: string[];
}

interface City {
  name: string;
  display_name: string;
  charging_stations: string[];
  parking_zones: string[];
  rules: string[];
}

interface ChargingStation {
  charging_id: string;
  area: [number, number][];
}

interface ParkingZone {
  parking_id: string;
  area: [number, number][];
}

interface Rule {
  rule_id: string;
  description: string;
}
export type {
  FormData,
  City,
  ParkingZone,
  ChargingStation,
  Rule
};
