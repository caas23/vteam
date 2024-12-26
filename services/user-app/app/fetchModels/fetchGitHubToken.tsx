export const fetchGitHubAccessToken = async (code: string) => {
  const type = 'app';
  try {
    const response = await fetch("http://vteambackend.loca.lt/add/auth/github", {
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
    return null;
  }
};
