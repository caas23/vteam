interface Trip {
  _id: string;
  start_time: Date;
  end_time: Date;
  start_location: [number, number];
  end_location: [number, number];
}

interface TripDetailsProps {
  data: Trip;
}

interface TripMapProps {
  startLocation: [number, number];
  endLocation: [number, number];
  FetchedDistance?: (distance: number) => void;
}

export type {
  Trip,
  TripDetailsProps,
  TripMapProps
};
