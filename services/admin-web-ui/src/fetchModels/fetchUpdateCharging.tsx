import { ChargingStation } from "../components/AddCityForm/interfaces";

export const fetchUpdateCharging = async (station: ChargingStation) => {
    // testad
    try {
      const response = await fetch("http://localhost:1337/update/charging", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(station),
    });
  
    if (!response.ok) {
        throw new Error(response.statusText);
    }
  
    return await response.json();

    } catch (e) {
        console.error("Error updating charging station:", e);
    }
};