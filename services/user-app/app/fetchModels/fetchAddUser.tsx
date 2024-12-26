import * as SecureStore from 'expo-secure-store';

export const fetchAddUser = async (userData: object) => {
  const token = await SecureStore.getItemAsync('access_token')
  
  try {
    const response = await fetch("http://vteambackend.loca.lt/add/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
  
    if (!response.ok) {
        throw new Error(response.statusText);
    }
  
    return await response.json();

  } catch (error) {
    console.error("Error adding new user:", error);
    return null;
  }
};