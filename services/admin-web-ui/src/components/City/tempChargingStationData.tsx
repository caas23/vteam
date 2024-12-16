import { ChargingStation } from "../CityTable/interfaces";

const ChargingStation1: ChargingStation = {
  _id: "S001",
  "area": [
    [1.1, 1.1],
    [1.1, 1.1],
    [11.11, 11.11]
  ],
  plugs: [
      { id: 1, available: true },
      { id: 2, available: false },
      { id: 3, available: true },
  ],
};

const ChargingStation2: ChargingStation = {
  _id: "S002",
  "area": [
    [2.2, 2.2],
    [2.2, 2.2],
    [22.22, 22.22]
  ],
  plugs: [
      { id: 1, available: false },
      { id: 2, available: false },
      { id: 3, available: true },
  ],
};

const ChargingStation3: ChargingStation = {
  _id: "S003",
  "area": [
    [3.3, 3.3],
    [3.3, 3.3],
    [33.33, 33.33]
  ],
  plugs: [
      { id: 1, available: false },
      { id: 2, available: true },
      { id: 3, available: false },
  ],
};

const tempDataCharging: ChargingStation[] = [ChargingStation1, ChargingStation2, ChargingStation3];

export { ChargingStation1, ChargingStation2, ChargingStation3, tempDataCharging };