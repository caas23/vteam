export const fetchDeleteItem = async (city: string, id: string, type: any) => {
  try {
    const response = await fetch(`http://localhost:1337/delete/${city}/${type}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem('access_token')}`,
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

  } catch (e) {
    console.error(`Error deleting ${type}:`, e);
    throw e;
  }
};
