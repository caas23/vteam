export const fetchBanUser = async (user_id: string) => {
    try {
      const response = await fetch("http://localhost:1337/add/ban/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({user_id}),
    });
  
    if (!response.ok) {
        throw new Error(response.statusText);
    }
  
    return await response.json();

    } catch (e) {
        console.error("Error banning user:", e);
    }
};