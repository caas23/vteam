import * as SecureStore from 'expo-secure-store';

export default async function fetchUpdateUse (data: object) {
    const token = await SecureStore.getItemAsync('access_token');
    console.log(data)
    try {
      const response = await fetch("http://vteambackend.loca.lt/update/user/payment", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

      if (!response.ok) {
          throw new Error(response.statusText);
      }
    
      return await response.json();

    } catch (error) {
        // console.error("Error updating user:", error);
    }
};