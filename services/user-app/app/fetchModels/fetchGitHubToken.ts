import Constants from 'expo-constants';

export default async function fetchGitHubAccessToken(code: string) {
	const type = 'app';
	const { BACKEND_URL } = Constants?.expoConfig?.extra as { BACKEND_URL: string };
	
	try {
		const response = await fetch(`${BACKEND_URL}/v1/add/auth/github`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ code, type }),
	});

	if (!response.ok) {
		throw new Error("Failed to fetch access token");
	}

	const data = await response.json();
	return data;

	} catch (error) {
		return;
	}
};
