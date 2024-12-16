export const fetchBikesPagination = async (
    page: number,
    bikeSearch: string
) => {
    try {
      const response = await fetch(
        `http://localhost:1337/get/all/bikes/pagination?page=${page}&search=${bikeSearch}`
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching bikes:", error);
      return { bikes: [], totalPages: 1 };
    }
};