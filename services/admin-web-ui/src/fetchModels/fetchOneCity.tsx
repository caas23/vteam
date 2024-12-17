export const fetchOneCity = async (
    city: string
) => {
    try {
      const response = await fetch(
        `http://localhost:1337/get/one/city/?city=${city}`
      );
      return await response.json();
    } catch (error) {
      console.error(`Error fetching city ${city}:`, error);
      return;
    }
};