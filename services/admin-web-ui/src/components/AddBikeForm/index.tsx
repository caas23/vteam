import React, { useState, useEffect } from "react";
import { City, ParkingZone, FormData } from "./interfaces";
import "./index.css";
import { handleCityChange, handleParkingZoneChange, handleMarkerClick } from "./formHandlers";
import AddBikeMap from "../AddBikeMap";
import { fetchAddbikeToCity } from "../../fetchModels/fetchAddbikeToCity";
import { fetchCityProps } from "../../fetchModels/fetchCityProps";
import { fetchCities } from "../../fetchModels/fetchCities";

const AddBikeForm: React.FC = () => {
  // data som sätts i formuläret
  const [formData, setFormData] = useState<FormData>({
    cityName: "",
    parkingZone: "",
  });

  const [cities, setCities] = useState<City[]>([]);
  const [availableZones, setAvailableZones] = useState<ParkingZone[]>([]);

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
      },
      completed_trips: []
    };

    try {
      const result = await fetchAddbikeToCity(newBike, cityName);
      console.log("Bike added:", result);
      alert("Bike added");
    } catch {
      alert("Error adding bike, no bike was added.");
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
            // handlern ligger i separat fil
            onChange={(e) => handleCityChange({e, formData, setFormData, setAvailableZones})}
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
            // handlern ligger i separat fil
            onChange={(e) => handleParkingZoneChange({e, formData, setFormData})}
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
          className="add-bike-btn"
          type="submit"
          disabled={!validForm}
        >
          Add Bike
        </button>
      </form>

      {!formData.cityName ? (
        <div className="add-bike-map no-map-selected">
          <p className="message">
            Choose a city to display available parking zones ...
          </p>
        </div>
      ) : (
        <AddBikeMap
          availableZones={availableZones}
          // handlern ligger i separat fil
          handleMarkerClick={(parking_id) => handleMarkerClick({parking_id, setFormData})}
        />
      )}
    </div>
  );
};

export default AddBikeForm;