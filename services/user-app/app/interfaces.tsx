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

interface User {
    _id: string;
    name: string;
    payment_method: string;
    banned: boolean;
    completed_trips: string[];
    user_id: string;
    balance: number;
}

interface UserDetailsProps {
    user: User;
    fetchUserData: () => Promise<void>;
}

interface TripUserDetailsProps {
    user: User;
}

interface Trip {
    _id: string;
    start_time: Date;
    end_time: Date;
    start_location: [number, number];
    end_location: [number, number];
    price: number;
    route: [number, number][];
    distance: number;
    trip_id: string;
    trip_info: string;
    fee: number;
    paid: boolean,
    payment_method: string;
}
  
interface TripDetailsProps {
    data: Trip;
    onClose: () => void;
}

interface TripMapProps {
    data: Trip;
	startLocation: [number, number];
	endLocation: [number, number];
	FetchedDistance?: (distance: number) => void;
}

const interfaces = {};
export default interfaces;
  
export type {
    City,
    Bike,
    ChargingStation,
    ParkingZone,
    AuthContext,
    User,
    UserDetailsProps,
    TripUserDetailsProps,
    TripDetailsProps,
    TripMapProps
};
  