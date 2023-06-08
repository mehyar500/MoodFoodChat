// utils/retryAxios.js
import axios from 'axios';

const retryAxios = async (url, options, retries = 3, delay = 1000) => {
  try {
    const response = await axios(url, options);
    return response;
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryAxios(url, options, retries - 1, delay);
  }
};

export default retryAxios;
