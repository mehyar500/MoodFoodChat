import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { Paper, Button, Tabs, Tab, Box } from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuthContext } from "../../contexts/AuthContext";

const RecipeCard = styled(Paper)(() => ({
  borderRadius: "15px",
  padding: "10px",
  marginBottom: "5px",
  width: "300px",
  height: 500,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  overflow: "hidden",
}));

const RecipeImage = styled("div")((props) => ({
  width: "100%",
  height: "0",
  paddingBottom: "75%",
  borderRadius: "10px",
  marginBottom: "8px",
  backgroundImage: `url(${props.imageUrl})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
}));

const RecipeTitle = styled("h4")(({ theme }) => ({
  marginBottom: "8px",
  color: theme.palette.text.primary,
}));

const FloatingButton = styled(Button)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
  '&:hover': {
    '& span': {
      display: 'initial',
    },
  },
  '& span': {
    display: 'none',
  },
}));

const StyledTabPanel = styled('div')(({ theme }) => ({
  overflowY: 'auto',
  maxHeight: '270px',
  padding: theme.spacing(1),
  boxSizing: 'border-box',
}));

const TabPanel = ({ children, value, index }) => {
  return (
    <StyledTabPanel role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </StyledTabPanel>
  );
};

const Recipe = ({ recipe, imageUrl, foodId, setOpenRecipeDialog }) => {
  const { user } = useAuthContext();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Set fallback values using nullish coalescing operator
  recipe.ingredients = recipe.ingredients ?? recipe.meta.ingredients;
  recipe.directions = recipe.directions ?? recipe.meta.directions;
  recipe.recipe_name = recipe.recipe_name ?? recipe.title;

  const handleBookmarkClick = async () => {
    if (!user) {
      setOpenRecipeDialog(true);
      return;
    }
    const token = Cookies.get('token');
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/${user._id}/bookmarks`,
        {
          recipeId: foodId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsBookmarked(response.status === 200 ? true : false);
    } catch (error) {
      console.error("Error saving the recipe:", error);
    }
  };

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const flattenIngredients = (ingredients) => {
    let flattenedIngredients = [];
    ingredients.forEach((ingredient) => {
      if (typeof ingredient === 'string') {
        flattenedIngredients.push(ingredient);
      } else {
        const {name, quantity, unit} = ingredient;
        flattenedIngredients.push(`${quantity} ${unit} ${name}`);
      }
    });
    return flattenedIngredients;
  };

  const tabsArray = [
      <Tab label="Ingredients" />,
      <Tab label="Directions" />,
    ];

  return (
    <RecipeCard elevation={1}>
      <RecipeImage imageUrl={imageUrl} alt={recipe.recipe_name}>
        <FloatingButton
          variant="outlined"
          color="primary"
          onClick={handleBookmarkClick}
          disabled={isBookmarked}
          title={isBookmarked ? "Bookmarked" : "Bookmark"}
        >
          <BookmarkIcon />
        </FloatingButton>
      </RecipeImage>
      <RecipeTitle>{recipe.recipe_name}</RecipeTitle>
      <Tabs value={tabValue} onChange={handleChange} variant="scrollable" scrollButtons="auto">
        {tabsArray.map((tab, index) => (
          <Tab key={index} label={tab.props.label} icon={tab.props.icon} />
        ))}
      </Tabs>
        <TabPanel value={tabValue} index={0}>
          <ul>
            {flattenIngredients(recipe?.ingredients)?.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <ol>
            {recipe?.directions?.map((direction, index) => (
              <li key={index}>{direction}</li>
            ))}
          </ol>
        </TabPanel>
    </RecipeCard>
  );
};

export default Recipe;

