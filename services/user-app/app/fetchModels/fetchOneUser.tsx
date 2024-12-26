import * as SecureStore from 'expo-secure-store';

export const fetchOneUserByGitId = async (id: number) => {
  const token = await SecureStore.getItemAsync('access_token')
  try {
    const response = await fetch(`http://vteambackend.loca.lt/get/one/git/user/?id=${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
        throw new Error(response.statusText);
    }
  
    return await response.json();

  } catch (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    return null;
  }
};