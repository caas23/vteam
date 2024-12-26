export default async function fetchCities() {
    try {
      const response = await fetch(
        'http://vteambackend.loca.lt/get/all/cities/noAuth', {
          method: 'GET',
          headers: {
            // 'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
          },
      });
      console.log(response)
      
      if (response.status === 401) {
        window.location.href = '/';
        return;
      }
    
      if (!response.ok) {
          throw new Error(response.statusText);
      }
    
      return await response.json();

    } catch (error) {
      // console.error('Error fetching cities:', error);
      return;
    }
};