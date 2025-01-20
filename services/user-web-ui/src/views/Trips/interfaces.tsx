interface Trips {
    map: any;
    completed_trips: string[];
    length: number
}

interface TripDetailsProps {
    trips: Trips;
}
  
export type {
    Trips,
    TripDetailsProps
};
