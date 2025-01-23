import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

export default async function fetchZones(type: string) {
	const token = await SecureStore.getItemAsync('access_token')
	const { BACKEND_URL } = Constants?.expoConfig?.extra as { BACKEND_URL: string };
    
	try {
        const response = await fetch(`${BACKEND_URL}/get/all/${type}`, {
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
		// console.error(`Error fetching ${type} zones:`, error);
		return;
	}
};