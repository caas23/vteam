export const fetchOneUser = async (
    user_id: string
) => {
    try {
      const response = await fetch(
        `http://localhost:1337/get/one/user/?user_id=${user_id}`
      );
      return await response.json();
    } catch (error) {
      console.error(`Error fetching user ${user_id}:`, error);
      return;
    }
};