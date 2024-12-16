import { City, ParkingZone } from "../AddBikeForm/interfaces";

export const parkingZoneData: ParkingZone[] = [
  {
    _id: "zone1",
    area: [
      [55.7047, 13.191],
      [55.705, 13.192],
      [55.7045, 13.190],
    ],
  },
  {
    _id: "zone2",
    area: [
      [55.7025, 13.192],
      [55.7028, 13.193],
      [55.7022, 13.191],
    ],
  },
  {
    _id: "zone3",
    area: [
      [55.706, 13.190],
      [55.7062, 13.191],
      [55.7058, 13.189],
    ],
  },
  {
    _id: "zone4",
    area: [
      [59.3604, 18.0265],
      [59.3606, 18.027],
      [59.3602, 18.026],
    ],
  },
  {
    _id: "zone5",
    area: [
      [59.362, 18.028],
      [59.3622, 18.029],
      [59.3618, 18.027],
    ],
  },
  {
    _id: "zone6",
    area: [
      [59.361, 18.027],
      [59.3612, 18.028],
      [59.3608, 18.026],
    ],
  },
  {
    _id: "zone7",
    area: [
      [64.7511, 20.9305],
      [64.7513, 20.931],
      [64.7509, 20.930],
    ],
  },
  {
    _id: "zone8",
    area: [
      [64.752, 20.931],
      [64.7522, 20.932],
      [64.7518, 20.930],
    ],
  },
  {
    _id: "zone9",
    area: [
      [64.753, 20.932],
      [64.7532, 20.933],
      [64.7528, 20.931],
    ],
  },
];

export const cityData: City[] = [
    {
      _id: "1",
      name: "Lund",
      bikes: [],
      parking_zones: ["zone1", "zone2", "zone3"],
      charging_stations: [],
    },
    {
      _id: "2",
      name: "Solna",
      bikes: [],
      parking_zones: ["zone4", "zone5", "zone6"],
      charging_stations: [],
    },
    {
      _id: "3",
      name: "Skellefteå",
      bikes: [],
      parking_zones: ["zone7", "zone8", "zone9"],
      charging_stations: [],
    },
  ];
