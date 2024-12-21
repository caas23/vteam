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
  _id: string;
  charging_id: string;
  area: [number, number][];
  plugs: {
    id: number;
    available: boolean;
  }[];
}

interface ParkingZone {
  _id: string;
  parking_id: string;
  area: [number, number][];
}

interface Rule {
  _id: string;
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
