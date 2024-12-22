export const fetchDeleteBike = async (bike_id: string) => {
  // testad
  try {
    const response = await fetch(`http://localhost:1337/delete/bike/${bike_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem('access_token')}`,
      },
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
    console.error(`Error deleting bike with id ${bike_id}:`, e);
    throw e;
  }
};
