interface ParkingZone {
  parking_id: string;
  area: [number, number][];
}

interface Bike {
  location: [number, number];
  city_name: string;
  speed: number;
  status: {
    available: boolean;
    battery_level: number;
    in_service: boolean;
  };
  completed_trips: string[];
}

interface City {
  _id: string;
  name: string;
  display_name: string;
  bikes: string[];
  charging_stations: string[];
  parking_zones: string[];
  rules: string[];
}

interface FormData {
  cityName: string;
  parkingZone: string;
}

export type {
  ParkingZone,
  Bike,
  City,
  FormData
};
