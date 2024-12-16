import React, { useState } from "react";
import { ParkingZone, FormData } from "./interfaces";
import { cityData } from "../AddBike/tempParkingZoneData";
import "./index.css";
import { handleCityChange, handleParkingZoneChange, handleMarkerClick } from "./formHandlers";
import AddBikeMap from "../AddBikeMap";
import { fetchAddbikeToCity } from "../../fetchModels/fetchAddbikeToCity";

const AddBikeForm: React.FC = () => {
  // data som sätts i formuläret
  const [formData, setFormData] = useState<FormData>({
    cityName: "",
    parkingZone: "",
  });

  // tillgängliga zoner för vald stad
  const [availableZones, setAvailableZones] = useState<ParkingZone[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { cityName, parkingZone } = formData;

    const selectedCity = cityData.find((city) => city.name === cityName);
    const selectedZone = availableZones.find((zone) => zone._id === parkingZone);

    const newBike = {
      location: selectedZone?.area?.[0] || [0, 0],
      city_name: selectedCity?.name || "",
      speed: 0,
      status: {
        available: true,
        battery_level: 100,
        in_service: false,
      },
      completed_trips: []
    };

    try {
      const result = await fetchAddbikeToCity(newBike, selectedCity?.name || "");
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
            {cityData.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name}
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
              <option key={zone._id} value={zone._id}>
                {zone._id}
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
          handleMarkerClick={(zoneId) => handleMarkerClick({zoneId, setFormData})}
        />
      )}
    </div>
  );
};

export default AddBikeForm;