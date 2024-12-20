export const fetchOneTrip = async (
  trip_id: string
) => {
  try {
    const response = await fetch(
      `http://localhost:1337/get/one/trip/?trip=${trip_id}`
    );
    return await response.json();
  } catch (error) {
    console.error(`Error fetching trip ${trip_id}:`, error);
    return;
  }
};