import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Helmet } from 'react-helmet';

const AboutUs = () => {
  return (
    <Container maxWidth="md">
      <Helmet>
        <meta
        name="description"
        content="MoodFood is your ultimate AI-driven GPT4 powered culinary companion, designed to transform your cooking experience. With features like personalized meal suggestions, inventive recipe creations, mood-based recommendations, ingredient identification, and on-demand cooking assistance, MoodFood is your ticket to the future of food. Join our vibrant community and embark on a flavorful adventure today."
      />
      </Helmet>
      <Box sx={{ my: 4 }}>
        <Typography variant="h2" align="center">
          About MoodFood
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Your GPT4 AI-Powered Personal Cooking Assistant
          </Typography>
          <Typography variant="body3">
            MoodFood is an AI-driven food app powered by GPT4 technology designed to revolutionize your cooking experience. Our powerful features streamline meal planning, inspire culinary creativity, and enhance your dining experience. Discover the future of food with MoodFood and join our growing community.
          </Typography>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Transform Your Cooking Experience
          </Typography>
          <Typography variant="body3">
            Embrace the future of food with MoodFood, your AI-driven cooking companion that streamlines meal planning, inspires culinary creativity, and enhances your dining experience. Our suite of features is designed to revolutionize the way you cook and consume food, making every meal an unforgettable adventure.
          </Typography>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Personalized Meal Suggestions
          </Typography>
          <Typography variant="body3">
            Say goodbye to meal planning woes with our intelligent image recognition technology that identifies ingredients in your fridge. Minimize food waste and enjoy personalized meal suggestions based on your available ingredients, ensuring you always have something delicious to cook.
          </Typography>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Creative Recipe Inspirations
          </Typography>
          <Typography variant="body3">
            Ignite your culinary imagination with our innovative tool that generates unique food combinations and dishes. Be inspired by visually captivating images of new creations and elevate your cooking skills with fresh, exciting recipes tailored just for you.
          </Typography>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Mood-Based Dining Experiences
          </Typography>
          <Typography variant="body3">
            Let your emotions guide your meal choices with our chatbot-driven feature that provides personalized meal recommendations based on your mood. Delight in the perfect dish that not only satisfies your cravings but also enhances your dining experience through the power of AI.
          </Typography>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Effortless Ingredient Identification
          </Typography>
          <Typography variant="body3">
            Enhance your culinary knowledge with our advanced AI technology that instantly identifies foods and ingredients in images. Discover new ingredients, learn about their properties, and expand your cooking repertoire with ease.
          </Typography>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Real-Time Cooking Assistance
          </Typography>
          <Typography variant="body3">
            Receive on-demand cooking help and recipe guidance through our AI chatbot. Improve your cooking skills and knowledge while creating mouth-watering meals in your kitchen with the support of your AI-powered culinary companion.
          </Typography>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Join the MoodFood Movement
          </Typography>
          <Typography variant="body3">
            Embrace the future of food and cooking by joining the MoodFood movement. Our growing community values the connection between food, emotions, and well-being. Together, we can revolutionize the way we perceive and consume food in our daily lives. Start your journey with MoodFood today.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default AboutUs;