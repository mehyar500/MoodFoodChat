import React from 'react';
import { styled } from '@mui/material/styles';
import { Typography, Paper } from '@mui/material';

const RecipeCard = styled(Paper)(() => ({
  borderRadius: '15px',
  padding: '10px',
  marginBottom: '5px',
  width: '300px',
  height: 500,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  overflow: 'hidden',
}));

const RecipeImage = styled('div')((props) => ({
  width: '100%',
  height: '0',
  paddingBottom: '75%',
  borderRadius: '10px',
  marginBottom: '8px',
  backgroundImage: `url(${props.imageUrl})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
}));

const RecipeTitle = styled('h4')(({ theme }) => ({
  marginBottom: '8px',
  color: theme.palette.text.primary,
}));

const RecipeContent = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '200px',
  overflow: 'auto',
}));

const RecipeInfo = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
}));

const BoldTypography = styled(Typography)(() => ({
  fontStyle: 'italic',
  fontWeight: 'bold',
  marginRight: '5px',
}));

const RecipeRec = ({ recipe, imageUrl }) => {
  recipe.recipe_name = recipe.recipe_name ?? recipe.title;
  recipe.category = recipe.category ?? recipe.menu_category;

  return (
    <RecipeCard elevation={1}>
      <RecipeImage imageUrl={imageUrl} alt={recipe.recipe_name} />
      <RecipeTitle>{recipe.recipe_name}</RecipeTitle>
      <RecipeContent>
        <RecipeInfo>
          <BoldTypography variant="subtitle2" gutterBottom>
            Cuisine:
          </BoldTypography>
          <Typography variant="subtitle2" gutterBottom>
            {recipe?.cuisine}
          </Typography>
        </RecipeInfo>
        <RecipeInfo>
          <BoldTypography variant="subtitle2" gutterBottom>
            Menu Category:
          </BoldTypography>
          <Typography variant="subtitle2" gutterBottom>
            {recipe?.category}
          </Typography>
        </RecipeInfo>
        <BoldTypography variant="subtitle2" gutterBottom>
          Reason for Recommendation:
        </BoldTypography>
        <Typography variant="subtitle2" gutterBottom>
          {recipe?.reason_for_recommendation}
        </Typography>
      </RecipeContent>
    </RecipeCard>
  );
};

export default RecipeRec;
