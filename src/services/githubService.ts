import axios from 'axios';

const API_URL = 'https://api.github.com';

export const searchRepositories = async (query: string) => {
  try {
    const response = await axios.get(`${API_URL}/search/repositories?q=${query}`);
    return response.data.items;
  } catch (error) {
    console.error(error);
    return [];
  }
};
