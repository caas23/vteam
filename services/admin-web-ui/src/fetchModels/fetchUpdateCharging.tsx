import { ChargingStation } from "../components/AddCityForm/interfaces";

export const fetchUpdateCharging = async (station: ChargingStation) => {
    try {
      const response = await fetch("http://localhost:1337/v1/update/charging", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(station),
    });

      if (response.status === 401) {
        window.location.href = '/';
        return;
      } 
    
      if (!response.ok) {
          throw new Error(response.statusText);
      }
    
      return await response.json();

    } catch (e) {
        console.error("Error updating charging station:", e);
    }
};