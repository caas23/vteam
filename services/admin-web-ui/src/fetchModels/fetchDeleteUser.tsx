export const fetchDeleteUser = async (user_id: string) => {
  try {
    // testad
    const response = await fetch(`http://localhost:1337/delete/user/${user_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return await response.json();
  } catch (e) {
    console.error(`Error deleting user with id ${user_id}:`, e);
    throw e;
  }
};
