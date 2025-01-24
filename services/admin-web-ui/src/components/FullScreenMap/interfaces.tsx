interface Bike {
	location: [number, number];
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

interface ChargingStation {
  charging_id: string;
  area: [number, number][];
}

interface ParkingZone {
  parking_id: string;
  area: [number, number][];
}

interface FullScreenMapProps {
  boxOpen: boolean;
  onClose: () => void;
  cityCenter: [number, number];
  cityBorders: any;
  bikes: Bike[];
  users: any;
  socket: any;
  availableZones: ParkingZone[];
  availableStations: ChargingStation[];
  filters: {
    available: boolean;
    green: boolean;
    orange: boolean;
    red: boolean;
    charging: boolean;
    parking: boolean;
  };
}

export type {
  FullScreenMapProps
};
