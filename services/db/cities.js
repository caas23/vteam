import { getCollection } from './collections.js';

// lägg till felhantering för dessa

export const city = {
  getCities: async () => {
    const result = await getCollection('cities').find().toArray();
    return result;
  },
  
  getOneCity: async (city) => {
    const result = await getCollection('cities').findOne({ name: city });
    return result;
  },
  
  getOneDisplayCity: async (city) => {
    const result = await getCollection('cities').findOne({ display_name: city });
    return result;
  },
  
  getChargingStations: async () => {
    const result = await getCollection('charging_station').find().toArray();
    return result;
  },
  
  getParkingZones: async () => {
    const result = await getCollection('parking_zone').find().toArray();
    return result;
  },
  
  getRules: async () => {
    const result = await getCollection('city_rules').find().toArray();
    return result;
  },

  getChargingStationsByCity: async (city) => {
    const result = await getCollection('cities').findOne({ name: city });
    const chargingStationIds = result.charging_stations;

    if (!chargingStationIds || chargingStationIds.length === 0) {
      return [];
    }

    const chargingStations = await getCollection('charging_station').find({
      charging_id: { $in: chargingStationIds }
    }).toArray();

    return chargingStations;
  },
  
  getParkingZonesByCity: async (city) => {
    const result = await getCollection('cities').findOne({ name: city });
    const parkingZoneIds = result.parking_zones;

    if (!parkingZoneIds || parkingZoneIds.length === 0) {
      return [];
    }

    const parkingZones = await getCollection('parking_zone').find({
      parking_id: { $in: parkingZoneIds }
    }).toArray();

    return parkingZones;
  },
  
  getParkingZonesByDisplayCity: async (city) => {
    const result = await getCollection('cities').findOne({ display_name: city });
    const parkingZoneIds = result.parking_zones;

    if (!parkingZoneIds || parkingZoneIds.length === 0) {
      return [];
    }

    const parkingZones = await getCollection('parking_zone').find({
      parking_id: { $in: parkingZoneIds }
    }).toArray();

    return parkingZones;
  },
  
  getRulesByCity: async (city) => {
    const result = await getCollection('cities').findOne({ name: city });
    const ruleIds = result.rules;

    if (!ruleIds || ruleIds.length === 0) {
      return [];
    }

    const rules = await getCollection('city_rules').find({
      rule_id: { $in: ruleIds }
    }).toArray();

    return rules;
  },
}

