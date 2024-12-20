export const fetchServiceBike = async (bike_id: string) => {
    try {
      const response = await fetch("http://localhost:1337/service/bike", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({bike_id}),
    });
  
    if (!response.ok) {
        throw new Error(response.statusText);
    }
  
    return await response.json();

    } catch (e) {
        console.error("Error updating status for bike:", e);
    }
};