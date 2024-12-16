interface ParkingZone {
  _id: string;
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

// inte fullständigt, har bara lagt in
// de delar som behövts under testning av 
// formuläret för att addera en cykel
interface City {
  _id: string;
  name: string;
  parking_zones: string[];
  bikes: string[];
  charging_stations: string[];
}

interface FormData {
  cityName: string;
  parkingZone: string;
}

interface HandleCityProps {
  e: React.ChangeEvent<HTMLSelectElement>;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  setAvailableZones: React.Dispatch<React.SetStateAction<ParkingZone[]>>;
}

interface HandleParkingProps {
  e: React.ChangeEvent<HTMLSelectElement>,
  formData: FormData,
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
}

interface HandleMarkerProps {
  zoneId: string,
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
}

export type {
  ParkingZone,
  Bike,
  City,
  FormData,
  HandleCityProps,
  HandleParkingProps,
  HandleMarkerProps
};
