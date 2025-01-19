import Constants from 'expo-constants';

export default async function fetchGitHubAccessToken(code: string) {
	const type = 'app';
	const { BACKEND_URL } = Constants?.expoConfig?.extra as { BACKEND_URL: string };
	
	try {
		const response = await fetch(`${BACKEND_URL}/add/auth/github`, {
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
	// console.log("Fetched GitHub access token data:", data);
	return data;

	} catch (error) {
		// console.error("Error fetching GitHub access token:", error);
		return;
	}
};
