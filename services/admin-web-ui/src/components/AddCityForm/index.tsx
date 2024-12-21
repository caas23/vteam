import React, { useState } from "react";
import { FormData } from "./interfaces";
import "./index.css";
import { fetchAddCity } from "../../fetchModels/fetchAddCity";
import AlertMessage from "../AlertMessage";
import { useNavigate } from "react-router-dom";

const AddCityForm: React.FC = () => {
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState("");
  const [alertBox, setAlertBox] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    display_name: "",
    charging_stations: [],
    parking_zones: [],
    rules: [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, display_name, charging_stations, parking_zones, rules } = formData;

    const newCity = {
      name: name,
      display_name: display_name,
      charging_stations: charging_stations || [],
      parking_zones: parking_zones || [],
      rules: rules || [],
    };

    try {
      const result = await fetchAddCity(newCity);
      console.log("City added:", result);
      setAlertMessage("A new city has been added. You will be redirected to its main page in five seconds...");

      setTimeout(() => {
        navigate(`/city/${name}`);
      }, 5000);
    } catch {
      setAlertMessage("Error adding city, no city was added.");
    } finally {
      setAlertBox(true)
    }
  };

  // check för att visuellt kunna visa att det inte går att
  // addera en stad utan att först ange stadens namn
  const validForm = formData.name && formData.display_name;

  return (
    <div>
      <form className="add-city-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">
            City name
            <span className="input-description-icon"></span>
            <div className="input-description">
              Enter the city name using [a-z], e.g 'lulea'
            </div>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label htmlFor="display_name">
            Displayed name
            <span className="input-description-icon"></span>
            <div className="input-description">
              The name that will be displayed, e.g. 'Luleå'
            </div>
          </label>
          <input
            type="text"
            id="display_name"
            name="display_name"
            value={formData.display_name}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* <div>
          <label htmlFor="charging_stations">
            Charging Stations
            <span className="input-description-icon"></span>
            <div className="input-description">
              Enter a comma-separated list of existing (if any) charging station id's.
              New station areas are defined under /city/:city once the city has been added.
            </div>
          </label>
          <input
            type="text"
            id="charging_stations"
            name="charging_stations"
            value={formData.charging_stations.join(", ")}
            onChange={(e) => setFormData({
              ...formData,
              charging_stations: e.target.value.split(",").map(item => item.trim())
            })}
          />
        </div>

        <div>
          <label htmlFor="parking_zones">
            Parking Zones
            <span className="input-description-icon"></span>
            <div className="input-description">
              Enter a comma-separated list of existing (if any) parking zones id's.
              New zone areas are defined under /city/:city once the city has been added.
            </div>
          </label>
          <input
            type="text"
            id="parking_zones"
            name="parking_zones"
            value={formData.parking_zones.join(", ")}
            onChange={(e) => setFormData({
              ...formData,
              parking_zones: e.target.value.split(",").map(item => item.trim())
            })}
          />
        </div>

        <div>
          <label htmlFor="rules">
            Rules
            <span className="input-description-icon"></span>
            <div className="input-description">
              Enter a comma-separated list of existing (if any) rule id's.
              New rules are defined under /city/:city once the city has been added.
            </div>
          </label>
          <input
            type="text"
            id="rules"
            name="rules"
            value={formData.rules.join(", ")}
            onChange={(e) => setFormData({
              ...formData,
              rules: e.target.value.split(",").map(item => item.trim())
            })}
          />
        </div> */}

        <div>
          <p className="message">Charing stations, parking zones, bikes and rules are added once the city has been added.</p>
        </div>

        <button
          className="add-btn"
          type="submit"
          disabled={!validForm}
        >
          Add city
        </button>
      </form>
      <AlertMessage
				boxOpen={alertBox}
				onClose={() => setAlertBox(false)}
				message={alertMessage}
			/>
    </div>
  );
};

export default AddCityForm;