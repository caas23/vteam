export const fetchAddUser = async (userData: object) => {
  try {
    const response = await fetch("http://localhost:1337/add/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Failed to add user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding new user:", error);
    return null;
  }
};