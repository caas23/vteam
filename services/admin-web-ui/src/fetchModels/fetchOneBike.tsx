export const fetchOneBike = async (
    bike_id: string
) => {
    try {
      const response = await fetch(
        `http://localhost:1337/get/one/bike/?bike_id=${bike_id}`
      );
      return await response.json();
    } catch (error) {
      console.error(`Error fetching bike ${bike_id}:`, error);
      return;
    }
};