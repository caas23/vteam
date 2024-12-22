export const fetchAddUser = async (userData: object) => {
  try {
    const response = await fetch("http://localhost:1337/add/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(userData),
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
    console.error("Error adding new user:", error);
    return null;
  }
};