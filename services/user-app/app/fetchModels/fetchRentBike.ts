import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

export default async function fetchRentBike(data: object) {
	const token = await SecureStore.getItemAsync('access_token')
	const storedUser = await SecureStore.getItemAsync('user')
	const git_id = storedUser && JSON.parse(storedUser).id;
	const { BACKEND_URL } = Constants?.expoConfig?.extra as { BACKEND_URL: string };

	const rentData = {
		bike: data,
		git_id
	}
  
	try {
		const response = await fetch(`${BACKEND_URL}/add/rent/bike`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify(rentData),
	});
	
	if (!response.ok) {
		throw new Error(response.statusText);
	}
	const result = await response.json();
	console.log(result) 
	return result


	} catch (error) {
		// console.error("Error renting bike:", error);
		return;
	}
};