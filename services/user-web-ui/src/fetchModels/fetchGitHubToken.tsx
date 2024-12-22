export const fetchGitHubAccessToken = async (code: string) => {
  try {
    const response = await fetch("http://localhost:1337/add/auth/github", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch access token");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching GitHub access token:", error);
    return null;
  }
};