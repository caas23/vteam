import { ParkingZone } from "../CityTable/interfaces";

const ParkingZone1: ParkingZone = {
  _id: "P001",
  "area": [
    [1.1, 1.1],
    [1.1, 1.1],
    [11.11, 11.11]
  ],
};

const ParkingZone2: ParkingZone = {
  _id: "P002",
  "area": [
    [2.2, 2.2],
    [2.2, 2.2],
    [22.22, 22.22]
  ],
};

const ParkingZone3: ParkingZone = {
  _id: "P003",
  "area": [
    [3.3, 3.3],
    [3.3, 3.3],
    [33.33, 33.33]
  ],
};

const tempDataParking: ParkingZone[] = [ParkingZone1, ParkingZone2, ParkingZone3];

export { ParkingZone1, ParkingZone2, ParkingZone3, tempDataParking };
