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
      await fetchAddCity(newCity);
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

  // check to visually show that it is not possible to
  // add a city without first specifying the city name
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