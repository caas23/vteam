import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

export default async function fetchUpdateUse (data: object) {
  const token = await SecureStore.getItemAsync('access_token');
  const { BACKEND_URL } = Constants?.expoConfig?.extra as { BACKEND_URL: string };
  
  try {
      const response = await fetch(`${BACKEND_URL}/v1/update/user/payment`, {
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
		return;
    }
};