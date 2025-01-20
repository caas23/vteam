export const fetchUpdateBalance = async (user_id: string, newBalance: number) => {
    try {
      const response = await fetch("http://localhost:1337/update/user/balance", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({user_id, newBalance}),
    });

      if (response.status === 401) {
        window.location.href = '/';
        return;
      }
    
      if (!response.ok) {
          throw new Error(response.statusText);
      }
    
      return await response.json();

    } catch (e) {
        console.error("Error banning user:", e);
    }
};