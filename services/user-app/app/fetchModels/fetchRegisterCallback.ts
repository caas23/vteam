import Constants from 'expo-constants';

export default async function fetchRegisterCallback(urlId: string) {
	const { BACKEND_URL } = Constants?.expoConfig?.extra as { BACKEND_URL: string };
  
	try {
		const response = await fetch(`${BACKEND_URL}/get/register/callback`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ urlId }),
	});
	
	if (!response.ok) {
		throw new Error(response.statusText);
	}
	return await response.json();

	} catch (error) {
		// console.error("Error adding new url:", error);
		return;
	}
};