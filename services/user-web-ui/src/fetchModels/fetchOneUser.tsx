export const fetchOneUserByGitId = async (id: number) => {
  try {
    const response = await fetch(`http://localhost:1337/get/one/git/user/?id=${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    return null;
  }
};