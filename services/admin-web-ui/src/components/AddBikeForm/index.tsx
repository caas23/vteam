import React, { useState, useEffect } from "react";
import { City, ParkingZone, FormData } from "./interfaces";
import "./index.css";
import ParkingZonesMap from "../ParkingZonesMap";
import { fetchAddbikeToCity } from "../../fetchModels/fetchAddbikeToCity";
import { fetchCities } from "../../fetchModels/fetchCities";
import { fetchCityProps } from "../../fetchModels/fetchCityProps";
import AlertMessage from "../AlertMessage";


const AddBikeForm: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [availableZones, setAvailableZones] = useState<ParkingZone[]>([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertBox, setAlertBox] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    cityName: "",
    parkingZone: "",
  });

  useEffect(() => {
    const fetchAndSetCities = async () => {
      try {
        const result = await fetchCities();
        setCities(result);
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      }
    };
    fetchAndSetCities();
  }, []);

  useEffect(() => {
    if (formData.cityName) {
      const fetchAndSetParkingZones = async () => {
        try {
          const parkingZones = await fetchCityProps(formData.cityName, "parking");
          setAvailableZones(parkingZones);
        } catch (error) {
          console.error("Could not fetch parking zones:", error);
        }
      };
      fetchAndSetParkingZones();
    }
  }, [formData.cityName]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value;
    setFormData({ ...formData, cityName, parkingZone: "" });
  };

  const handleParkingZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, parkingZone: e.target.value });
  };

  const handleMarkerClick = (parking_id: string) => {
    setFormData((prev) => ({ ...prev, parkingZone: parking_id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { cityName, parkingZone } = formData;

    const selectedZone = availableZones.find((zone) => zone.parking_id === parkingZone);

    const newBike = {
      location: selectedZone?.area?.[0] || [0, 0],
      city_name: cityName,
      speed: 0,
      status: {
        available: true,
        battery_level: 100,
        in_service: false,
        parking: true,
        charging: false,
      },
      completed_trips: []
    };

    try {
      const result = await fetchAddbikeToCity(newBike);
      console.log("Bike added:", result);
      setAlertMessage("A new bike has been added.");
    } catch {
      setAlertMessage("Error adding bike, no bike was added.");
    } finally {
			setAlertBox(true);
    }
  };

  // check för att visuellt kunna visa att det inte går att
  // addera en cykel utan att först välja stad och parkeringszon
  const validForm = formData.cityName && formData.parkingZone;

  return (
    <div>
      <form className="add-bike-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="cityName">City</label>
          <select
            id="cityName"
            name="cityName"
            value={formData.cityName}
            onChange={handleCityChange}
            required
          >
            <option value="" disabled>Choose city ...</option>
            {cities.map((city) => (
              <option key={city.name} value={city.display_name}>
                {city.display_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="parkingZone">Parking Zone</label>
          <select
            id="parkingZone"
            name="parkingZone"
            value={formData.parkingZone}
            onChange={handleParkingZoneChange}
            disabled={!formData.cityName}
            required
          >
            <option value="" disabled>Choose zone ...</option>
            {availableZones.map((zone) => (
              <option key={zone.parking_id} value={zone.parking_id}>
                {zone.parking_id}
              </option>
            ))}
          </select>
        </div>

        <button
          className="add-btn"
          type="submit"
          disabled={!validForm}
        >
          Add Bike
        </button>
      </form>

      {!formData.cityName ? (
        <div className="no-map-selected">
          <p>
            Choose a city to display available parking zones ...
          </p>
        </div>
      ) : (
        <ParkingZonesMap
          key={formData.cityName}
          availableZones={availableZones}
          handleMarkerClick={handleMarkerClick}
          city={formData.cityName}
        />
      )}

      <AlertMessage
				boxOpen={alertBox}
				onClose={() => setAlertBox(false)}
				message={alertMessage}
			/>
    </div>
  );
};

export default AddBikeForm;