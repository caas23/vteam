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
}

interface TripMapProps {
  data: Trip;
  startLocation: [number, number];
  endLocation: [number, number];
  FetchedDistance?: (distance: number) => void;
}

export type {
  Trip,
  TripDetailsProps,
  TripMapProps
};
