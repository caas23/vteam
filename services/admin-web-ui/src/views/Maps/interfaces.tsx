interface City {
  _id: string;
  name: string;
  display_name: string;
  bikes: string[];
  charging_stations: string[];
  parking_zones: string[];
  rules: string[];
}

export type {
  City,
};