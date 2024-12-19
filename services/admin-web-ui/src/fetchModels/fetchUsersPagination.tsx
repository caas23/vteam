export const fetchUsersPagination = async (
    page: number,
    userSearch: string
) => {
    try {
      const response = await fetch(
        `http://localhost:1337/get/all/users/pagination?page=${page}&search=${userSearch}`
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching users:", error);
      return { users: [], totalPages: 1 };
    }
};