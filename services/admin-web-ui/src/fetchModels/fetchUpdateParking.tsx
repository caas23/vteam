import { ParkingZone } from "../components/AddCityForm/interfaces";

export const fetchUpdateParking = async (zone: ParkingZone) => {
    try {
      const response = await fetch("http://localhost:1337/add/update/parking", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(zone),
    });
  
    if (!response.ok) {
        throw new Error(response.statusText);
    }
  
    return await response.json();

    } catch (e) {
        console.error("Error updating parking zone:", e);
    }
};