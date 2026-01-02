import axios from 'axios';

const API_URL = 'https://api.npms.io/v2';

export const searchPackages = async (query: string) => {
  try {
    const response = await axios.get(`${API_URL}/search?q=${query}`);
    return response.data.results;
  } catch (error) {
    console.error(error);
    return [];
  }
};
