import { Rule } from "../components/AddCityForm/interfaces";

export const fetchUpdateRule = async (rule: Rule) => {
    try {
      const response = await fetch("http://localhost:1337/update/rule", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(rule),
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
        console.error("Error updating rule:", e);
    }
};