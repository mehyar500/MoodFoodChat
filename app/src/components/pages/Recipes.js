import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Typography, List, ListItem, ListItemText } from '@mui/material';

const Recipes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    if (searchQuery) {
      const fetchRecipes = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/recipes/search?q=${searchQuery}`);
          setRecipes(response.data);
        } catch (error) {
          console.error('Error searching for recipes:', error);
        }
      };

      fetchRecipes();
    }
  }, [searchQuery]);

  return (
    <Box>
      <Typography variant="h4">Recipes</Typography>
      <Box my={2}>
        <TextField
          fullWidth
          label="Search for a recipe"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
        />
      </Box>
      <Box>
        <List>
            {recipes.map((recipe, index) => (
            <ListItem key={index}>
                <ListItemText primary={recipe.title} secondary={recipe.reason_for_recommendation} />
            </ListItem>
            ))}
        </List>
      </Box>
    </Box>
  );
};

export default Recipes;
