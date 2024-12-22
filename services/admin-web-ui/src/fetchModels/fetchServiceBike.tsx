export const fetchServiceBike = async (bike_id: string) => {
    try {
      const response = await fetch("http://localhost:1337/service/bike", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({bike_id}),
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
        console.error("Error updating status for bike:", e);
    }
};