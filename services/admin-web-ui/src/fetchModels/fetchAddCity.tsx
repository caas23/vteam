import { City } from "../components/AddCityForm/interfaces";

export const fetchAddCity = async (city: City) => {
    try {
      const response = await fetch("http://localhost:1337/add/city", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city
        }),
    });
  
    if (!response.ok) {
        throw new Error(response.statusText);
    }
  
    return await response.json();

    } catch (e) {
        console.error("Error adding bike:", e);
    }
};