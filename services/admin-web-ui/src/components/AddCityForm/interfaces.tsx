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

export type {
  FormData,
  City
};
