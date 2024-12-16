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
  };
  completed_trips: string[];
}

interface ChargingStation {
  _id: string;
  area: number[][];
  plugs: {
    id: number;
    available: boolean;
  }[];
}

interface ParkingZone {
  _id: string;
  area: number[][];
}

interface Rule {
  _id: string;
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
}

interface CityTableRowProps {
  row: CityTableRow;
  rowIndex: number;
  selectedRow: number | null;
  toggleDetails: (index: number) => void;
}

interface CityTableProps {
  rows: CityTableRow[];
}

interface CityShowRowDetailsProps {
  data: CityTableRow['data'];
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
