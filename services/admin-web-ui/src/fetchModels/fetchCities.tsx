export const fetchCities = async () => {
    try {
      const response = await fetch(
        'http://localhost:1337/v1/get/all/cities', {
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
      console.error('Error fetching cities:', error);
      return;
    }
};