import { Bike } from "../components/AddBikeForm/interfaces";

export const fetchAddbikeToCity = async (bike: Bike) => {
    try {
      const response = await fetch("http://localhost:1337/v1/add/bike/to/city", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ bike }),
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
        console.error("Error adding bike:", e);
    }
};