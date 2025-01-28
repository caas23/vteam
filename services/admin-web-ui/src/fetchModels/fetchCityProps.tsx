export const fetchCityProps = async (
  city: string,
  type: string,
) => {
  try {
      const response = await fetch(
        `http://localhost:1337/v1/get/all/${type}/in/city?city=${city}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
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

    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      return [];
    }
};