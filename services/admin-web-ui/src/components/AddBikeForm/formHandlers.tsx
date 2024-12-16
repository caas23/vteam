import { cityData, parkingZoneData } from "../AddBike/tempParkingZoneData"; // ska bytas ut så fort det finns fakstisk data för parkeringszoner
import { HandleCityProps, HandleParkingProps, HandleMarkerProps } from "./interfaces";

const handleCityChange = ({
  e,
  formData,
  setFormData,
  setAvailableZones,
}: HandleCityProps) => {
  const cityName = e.target.value;
  setFormData({ ...formData, cityName, parkingZone: "" });

  // hämta och sätt zoner för given city
  const selectedCity = cityData.find((city) => city.name === cityName);
  const zones = selectedCity
  ? selectedCity.parking_zones.map((zoneId) => {
      return {
        _id: zoneId,
        area: parkingZoneData.find((zone) => zone._id === zoneId)?.area || [],
      };
    })
  : [];
  setAvailableZones(zones);
};

// uppdatera selectad zon baserat på val i dropdownen
const handleParkingZoneChange = ({
  e,
  formData,
  setFormData,
}: HandleParkingProps) => {
  setFormData({ ...formData, parkingZone: e.target.value });
};

// uppdatera selectad zon baserat på klickad markör på kartan
const handleMarkerClick = ({
  zoneId,
  setFormData,
}: HandleMarkerProps) => {
  setFormData((prevFormData) => ({ ...prevFormData, parkingZone: zoneId }));
};

export {
    handleCityChange,
    handleParkingZoneChange,
    handleMarkerClick
 }
