export const fetchUpdatePaymentStatus = async (trip_id: string, paid: boolean, method: string) => {
  try {
    const response = await fetch("http://localhost:1337/update/user/paymentstatus", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem('access_token')}`,
      },
      body: JSON.stringify({trip_id, paid, method}),
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
      console.error("Error updating payment status:", e);
  }
};