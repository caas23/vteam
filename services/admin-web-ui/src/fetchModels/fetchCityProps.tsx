export const fetchCityProps = async (
  city: string,
  type: string,
) => {
  try {
      const response = await fetch(
        `http://localhost:1337/get/all/${type}/in/city?city=${city}`
      );
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      return [];
    }
};