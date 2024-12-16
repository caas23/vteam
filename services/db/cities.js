import { getCollection } from './collections.js';

export const getCities = async () => {
  const cities = await getCollection('cities').find().toArray();
  return cities;
};

export const getChargingStations = async () => {
  const cities = await getCollection('charging_station').find().toArray();
  return cities;
};

export const getParkingZones = async () => {
  const cities = await getCollection('parking_zone').find().toArray();
  return cities;
};

