interface City {
    name: string;
    display_name: string;
    bikes: string[];
    charging_stations: string[];
    parking_zones: string[];
    rules: string[];
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
    bike_id: string;
}

interface ChargingStation {
    charging_id: string;
    area: [number, number][];
}

interface ParkingZone {
    parking_id: string;
    area: [number, number][];
}

interface Rules {
    _id: string;
    rule_id: string;
    description: string;
}
  
export type {
    City,
    Bike,
    ChargingStation,
    ParkingZone,
    Rules
};
  