export const fetchUsersPagination = async (
    page: number,
    userSearch: string
) => {
    try {
      const response = await fetch(
        `http://localhost:1337/v1/get/all/users/pagination?page=${page}&search=${userSearch}`, {
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
      console.error("Error fetching users:", error);
      return { users: [], totalPages: 1 };
    }
};