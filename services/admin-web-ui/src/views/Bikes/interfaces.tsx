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

export type {
  Bike,
};
