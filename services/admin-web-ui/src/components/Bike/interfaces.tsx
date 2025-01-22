interface Bike {
  _id: string;
  location: [number, number];
  cityId: string;
  city_name: string;
  speed: number;
  status: {
    available: boolean;
    battery_level: number;
    in_service: boolean;
    charging: boolean;
    parking: boolean;
  };
  completed_trips: string[];
  bike_id: string;
}

interface BikeDetailsProps {
  data: Bike;
}

export type {
  Bike,
  BikeDetailsProps
};
