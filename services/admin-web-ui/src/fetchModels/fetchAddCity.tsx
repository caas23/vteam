import { City } from "../components/AddCityForm/interfaces";

export const fetchAddCity = async (city: City) => {
    try {
      const response = await fetch("http://localhost:1337/v1/add/city", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ city }),
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