export const fetchOneUserByGitId = async (id: number) => {
  try {
    const response = await fetch(`http://localhost:1337/v1/get/one/git/user/?id=${id}`, {
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
    console.error(`Error fetching user with id ${id}:`, error);
    return null;
  }
};