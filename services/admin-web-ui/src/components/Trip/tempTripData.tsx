import { Trip } from "./interfaces";

const Trip1: Trip = {
  _id: "T001",
  start_time: new Date("2024-12-09T01:01:01"),
  end_time: new Date("2024-12-09T01:11:11"),
  start_location: [55.7047, 13.1910],
  end_location: [55.7130, 13.2115],
};

const Trip2: Trip = {
  _id: "T002",
  start_time: new Date("2024-12-09T02:02:02"),
  end_time: new Date("2024-12-09T02:12:12"),
  start_location: [59.3326, 18.0200],
  end_location: [59.3450, 18.0255],
};

const Trip3: Trip = {
  _id: "T003",
  start_time: new Date("2024-12-09T03:03:03"),
  end_time: new Date("2024-12-09T03:13:13"),
  start_location: [64.7543, 20.9515],
  end_location: [64.7680, 20.9640],
};

const tempDataTrips = [
  {
    _id: Trip1._id,
    start_time: Trip1.start_time,
    end_time: Trip1.end_time,
    start_location: Trip1.start_location,
    end_location: Trip1.end_location,
  },
  {
    _id: Trip2._id,
    start_time: Trip2.start_time,
    end_time: Trip2.end_time,
    start_location: Trip2.start_location,
    end_location: Trip2.end_location,
  },
  {
    _id: Trip3._id,
    start_time: Trip3.start_time,
    end_time: Trip3.end_time,
    start_location: Trip3.start_location,
    end_location: Trip3.end_location,
  },
];

export { Trip1, Trip2, Trip3, tempDataTrips };
