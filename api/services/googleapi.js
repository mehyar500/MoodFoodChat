const axios = require('axios');
const rateLimit = require('axios-rate-limit');
const { google } = require('googleapis');
const cheerio = require('cheerio');

require('dotenv').config();

async function searchFoodImage(query) {
  try {
    const customsearch = google.customsearch({
      version: 'v1',
      auth: process.env.GOOGLE_API_KEY,
    });

    const response = await customsearch.cse.list({
      q: query,
      cx: process.env.GOOGLE_CSE_ID,
      searchType: 'image',
      num: 10,
      fileType: 'jpg,png',
      imgSize: 'medium',
    });

    // Process the response and extract the desired data
    return response.data.items.map(item => {
      item.link
      return {
        ...item,
        imageUrl: item.link,
      };
    });
  } catch (error) {
    console.error('Error searching food image:', error);
    return [];
  }
};

async function extractRecipeFromUrl(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const jsonLd = $('script[type="application/ld+json"]');

    for (let i = 0; i < jsonLd.length; i++) {
      const data = JSON.parse(jsonLd[i].children[0].data);
      if (data['@type'] === 'Recipe') {
        return data;
      }
    }
  } catch (error) {
    console.error(`Error extracting recipe from URL (${url}):`, error);
  }
  return null;
}

async function searchForRecipe(query, options = { limit: 3 }) {
  try {
    const customsearch = google.customsearch({
      version: 'v1',
      auth: process.env.GOOGLE_API_KEY,
    });

    const response = await customsearch.cse.list({
      q: `${query} recipe`,
      cx: process.env.GOOGLE_CSE_ID,
      num: options.limit,
    });
    console.log(response.data.items);
    const recipePromises = response.data.items.map(item => extractRecipeFromUrl(item.link));
    const recipes = await Promise.all(recipePromises);
    return recipes.filter(recipe => recipe !== null);

  } catch (error) {
    console.error('Error searching for recipes:', error);
    return [];
  }
};

module.exports = {
  searchFoodImage,
  searchForRecipe,
};
