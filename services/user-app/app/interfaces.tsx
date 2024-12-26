interface City {
    _id: string;
    name: string;
    display_name: string;
    bikes: string[];
    charging_stations: string[];
    parking_zones: string[];
    rules: string[];
}

interface Bike {
    _id: string;
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
    _id: string;
    charging_id: string;
    area: [number, number][];
    plugs: {
      id: number;
      available: boolean;
    }[];
}

interface ParkingZone {
    parking_id: string;
    area: [number, number][];
}

interface AuthContext {
    isAuthenticated: boolean | null;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
}
  
export type {
    City,
    Bike,
    ChargingStation,
    ParkingZone,
    AuthContext
};
  