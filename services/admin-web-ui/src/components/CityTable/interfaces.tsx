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

interface Rule {
  rule_id: string;
  description: string;
}

/*** City Table Interfaces ***/

interface CityTableRow {
  category: string;
  count: number;
  data: (Bike | ChargingStation | ParkingZone | Rule)[];
}

interface RowItemProps {
  item: Bike | ChargingStation | ParkingZone | Rule;
  onDelete: (category: string, id: string) => void;
}

interface CityTableRowProps {
  row: CityTableRow;
  rowIndex: number;
  selectedRow: number | null;
  toggleDetails: (index: number) => void;
  onDelete: (category: string, id: string) => void;
}

interface CityTableProps {
  rows: CityTableRow[];
  onDelete: (category: string, id: string) => void;
}

interface CityShowRowDetailsProps {
  data: CityTableRow['data'];
  onDelete: (category: string, id: string) => void;
}

export type {
  Bike,
  ChargingStation,
  ParkingZone,
  Rule,
  CityTableRow,
  RowItemProps,
  CityTableRowProps,
  CityTableProps,
  CityShowRowDetailsProps,
};
