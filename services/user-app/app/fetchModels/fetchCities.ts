import * as SecureStore from 'expo-secure-store';

export default async function fetchCities() {
    const token = await SecureStore.getItemAsync('access_token')
    
	try {
        const response = await fetch('http://vteambackend.loca.lt/get/all/cities', {
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
		// console.error('Error fetching cities:', error);
		return;
	}
};