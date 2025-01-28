export const fetchDeleteUser = async (user_id: string) => {
  try {
    const response = await fetch(`http://localhost:1337/v1/delete/user/${user_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
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
  } catch (e) {
    console.error(`Error deleting user with id ${user_id}:`, e);
    throw e;
  }
};
