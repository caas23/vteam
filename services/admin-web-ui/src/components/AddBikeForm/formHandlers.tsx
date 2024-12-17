import { ParkingZone, HandleCityProps, HandleParkingProps, HandleMarkerProps } from "./interfaces";
import { fetchCityProps } from "../../fetchModels/fetchCityProps";

const handleCityChange = async ({
  e,
  formData,
  setFormData,
  setAvailableZones,
}: HandleCityProps) => {
  const cityName = e.target.value;
  setFormData({ ...formData, cityName, parkingZone: "" });


  try {
    const parkingZones = await fetchCityProps(cityName, "parking");
    const zones = parkingZones.map((zone: ParkingZone) => ({
      parking_id: zone.parking_id,
      area: zone.area,
      
    }));
    setAvailableZones(zones);

  } catch (error) {
    console.error("City or parking zone could not be fetched", error);
  }
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
  parking_id,
  setFormData,
}: HandleMarkerProps) => {
  setFormData((prevFormData) => ({ ...prevFormData, parkingZone: parking_id }));
};

export {
    handleCityChange,
    handleParkingZoneChange,
    handleMarkerClick
 }
