export const fetchDeleteBike = async (bike_id: string) => {
  // testad
  try {
    const response = await fetch(`http://localhost:1337/delete/bike/${bike_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return await response.json();
  } catch (e) {
    console.error(`Error deleting bike with id ${bike_id}:`, e);
    throw e;
  }
};
