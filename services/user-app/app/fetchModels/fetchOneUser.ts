import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

export default async function fetchOneUserByGitId(id: number) {
	const token = await SecureStore.getItemAsync('access_token')
	const { BACKEND_URL } = Constants?.expoConfig?.extra as { BACKEND_URL: string };
	
	try {
		const response = await fetch(`${BACKEND_URL}/get/one/git/user/?id=${id}`, {
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
		// console.error(`Error fetching user with id ${id}:`, error);
		return;
	}
};