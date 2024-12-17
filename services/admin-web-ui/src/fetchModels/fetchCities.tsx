export const fetchCities = async () => {
    try {
      const response = await fetch(
        'http://localhost:1337/get/all/cities'
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching cities:', error);
      return;
    }
};