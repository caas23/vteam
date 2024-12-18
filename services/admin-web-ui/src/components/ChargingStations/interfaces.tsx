interface ChargingStation {
  _id: string;
  charging_id: string;
  area: [number, number][];
  plugs: {
    id: number;
    available: boolean;
  }[];
}

export type {
  ChargingStation,
};
