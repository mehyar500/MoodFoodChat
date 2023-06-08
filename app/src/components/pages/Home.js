import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Container,
  Typography,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
} from '@mui/material';
import { Helmet } from 'react-helmet';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import Recipe from "../common/Recipe";
import axios from 'axios';
import { useAuthContext } from '../../contexts/AuthContext';

const bannerData = [
  {
    image: '/assets/moodfood-banner-1.png',
    text:
      "Our image recognition technology identifies the ingredients in your fridge, minimizing food waste and making meal planning easy. With personalized meal suggestions based on your available ingredients, you'll never struggle with deciding what to cook again.",
  },
  {
    image: '/assets/moodfood-banner-2.png',
    text:
      'Unleash your culinary creativity with our innovative tool that generates unique food combinations and dishes. Get inspired by visually stunning images of new creations and elevate your cooking with fresh, exciting recipes.',
  },
  {
    image: '/assets/moodfood-banner-3.png',
    text:
      'Our chatbot-driven feature tailors meal recommendations to your mood, ensuring you find the perfect dish to satisfy your cravings and enhance your dining experience. Embrace the power of AI to transform the way you choose and enjoy food.',
  },
  {
    image: '/assets/moodfood-banner-4.png',
    text:
      'Get real-time help with cooking and recipe questions through our AI chatbot. Enhance your cooking skills and knowledge while creating delicious meals in your kitchen.',
  }
];

const RecipeCard = ({ recipe, imageUrl, setSelectedRecipe, setOpenRecipeModal, handleClick }) => {

  return (
    <Card sx={{ cursor: 'pointer' }} onClick={() => handleClick(recipe)}>
      <CardActionArea onClick={() => {
        setSelectedRecipe(recipe);
        setOpenRecipeModal(true);
      }}>
        <CardMedia
          component="img"
          height="200"
          image={imageUrl}
          alt={recipe.title}
        />
        <CardContent sx={{ height: 100, overflow: 'hidden' }}>
          <Typography gutterBottom variant="subtitle1">
            {recipe.title}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const Home = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useAuthContext();
  const [aiRecipes, setAiRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [openRecipeModal, setOpenRecipeModal] = useState(false);
  
  const handleClick = (recipe) => {
    // console.log('Clicked recipe:', recipe);
  };
  
  useEffect(() => {
    fetchLatestAiRecipes();
  }, []);

  const fetchLatestAiRecipes = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/recipes/latest`);
      setAiRecipes(response.data);
    } catch (error) {
      console.error('Error fetching AI-generated recipes:', error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleLoginWithGoogle = (subscriptionType) => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google?subscriptionType=${subscriptionType}`;
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? bannerData.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev === bannerData.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      handleNextSlide();
    }, 3000);
    return () => clearInterval(timer);
  }, [activeSlide]);

  return (
    <Container
    maxWidth="md"
      sx={{
        m: 'auto',
      }}
    >
      <Helmet>
        <title>MoodFood - What to Eat? AI-Driven Food Recommendations for Your Mood</title>
        <meta
          name="description"
          content="MoodFood helps you discover the perfect meal to match your feelings with personalized food suggestions using AI and chatbot technology."
        />
      </Helmet>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          MoodFood - Food That Never Existed Before
        </Typography>
        {!user && (
          <video style={{
            borderRadius: '10px',
          }} width="100%" controls poster="/assets/intro-thumbnail.jpeg">
            <source src="/assets/mood-food-intro.mp4" type="video/mp4" />
          </video>
        )}
        {!user && (
          <Box sx={{ position: 'relative', mb: 1 }}>
            {bannerData.map((banner, index) => (
              <Box
                key={index}
                sx={{
                  display: index === activeSlide ? 'block' : 'none',
                  width: '100%',
                }}
              >
                <Card sx={{ cursor: 'pointer' }}>
                  <CardActionArea onClick={() => setOpenDialog(true)}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={banner.image}
                      alt={`Banner ${index + 1}`}
                    />
                    <CardContent sx={{ height: 130, overflow: 'hidden' }}>
                      <Typography gutterBottom variant="subtitle1">
                        {banner.text}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            ))}
            <IconButton
              color="primary"
              aria-label="previous slide"
              onClick={handlePrevSlide}
              sx={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              color="primary"
              aria-label="next slide"
              onClick={handleNextSlide}
              sx={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>
        )}
        <Grid container spacing={2}>
        {aiRecipes.slice(0, 8).map((recipe) => (
          <Grid item xs={12} sm={6} md={6} ld={6} key={recipe._id}>
            <RecipeCard
              recipe={recipe}
              imageUrl={recipe.meta.imageUrl}
              setOpenRecipeDialog={setOpenDialog}
              setSelectedRecipe={setSelectedRecipe}
              setOpenRecipeModal={setOpenRecipeModal}
              handleClick={handleClick}
            />
          </Grid>
        ))}
        </Grid>
      </Box>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Login or Register</DialogTitle>
        <DialogContent>
          <Typography>
            You have 10,000 free daily tokens you can use a day. Click the button below to log in or register
            using your Google account.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleLoginWithGoogle('free')} color="primary">
            Sign In With Google
          </Button>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openRecipeModal}
        onClose={() => {
          setOpenRecipeModal(false);
          setSelectedRecipe(null);
        }}
      >
        {selectedRecipe && (
          <Recipe
            recipe={selectedRecipe}
            imageUrl={selectedRecipe.meta.imageUrl}
            foodId={selectedRecipe._id}
            setOpenRecipeDialog={setOpenRecipeModal}
          />
        )}
      </Dialog>
    </Container>
  );
};

export default Home;
