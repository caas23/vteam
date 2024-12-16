import { Bike } from "../components/AddBikeForm/interfaces";

export const fetchAddbikeToCity = async (bike: Bike, cityName: string) => {
    try {
      const response = await fetch("http://localhost:1337/add/bike/to/city", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bike,
          city: { name: cityName },
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