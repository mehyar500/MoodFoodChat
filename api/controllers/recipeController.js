const Food = require('../models/Food');
const { searchForRecipe } = require('../services/googleapi.js');

exports.getLatestAiRecipes = async (req, res) => {
  try {
    const aiRecipes = await Food.find({ ai_generated: true })
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json(aiRecipes);
  } catch (error) {
    console.error('Error fetching AI-generated recipes:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.searchRecipes = async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ error: 'Missing query parameter' });
      }
      console.log('Searching for recipes with query:', query);
      const recipes = await searchForRecipe(query);

      res.status(200).json(recipes);
    } catch (error) {
      console.error('Error searching for recipes:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
};