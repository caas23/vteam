import { ParkingZone } from "../components/AddCityForm/interfaces";

export const fetchUpdateParking = async (zone: ParkingZone) => {
    try {
      const response = await fetch("http://localhost:1337/update/parking", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(zone),
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
        console.error("Error updating parking zone:", e);
    }
};