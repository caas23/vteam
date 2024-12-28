import * as SecureStore from 'expo-secure-store';

export default async function fetchOneTrip(trip_id: string) {
  const token = await SecureStore.getItemAsync('access_token')
  
  try {
    const response = await fetch(
      `http://vteambackend.loca.lt/get/one/trip/?trip=${trip_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(response.statusText);
    }
  
    return await response.json();

  } catch (error) {
    // console.error(`Error fetching trip ${trip_id}:`, error);
    return;
  }
};