🍔 MoodFoodChat

MoodFood is an AI-driven food app powered by GPT4 technology designed to revolutionize your cooking experience. Our powerful features streamline meal planning, inspire culinary creativity, and enhance your dining experience. Discover the future of food with MoodFood and join our growing community.

🚀 Getting Started

This guide will walk you through the steps to set up the project locally.

Prerequisites
Node.js (version 14 or higher)
MongoDB
Git
Clone the Repository
bash
Copy code
git clone https://github.com/<username>/moodfood.git
Setup Backend
Navigate to the api folder and create a .env file by copying the .env.example file:
bash
Copy code
cd moodfood/api
cp .env.example .env
Open the .env file and replace the values with your own:
makefile
Copy code
MONGODB_URI=<your-mongodb-uri>
FRONTEND_BASE_URL=http://localhost:3000
BACKEND_BASE_URL=http://localhost:3030
COOKIE_KEY=<your-cookie-key>
OPENAI_API_KEY=<your-openai-api-key>
Install the dependencies and start the server:
bash
Copy code
npm install
npm start
The server will start on port 3030.

Setup Frontend
Open a new terminal window and navigate to the app folder:
bash
Copy code
cd ../app
Create a .env file by copying the .env.example file:
bash
Copy code
cp .env.example .env
Open the .env file and replace the values with your own:
bash
Copy code
REACT_APP_API_BASE_URL=http://localhost:3030/api
Install the dependencies and start the application:
bash
Copy code
npm install
npm start
The application will start on port 3000. Open your web browser and navigate to http://localhost:3000 to view the application.

🌐 Live Demo

You can also view a live demo of the MoodFood application at https://moodfood.app.

📦 Packages

Our application uses a number of packages to work properly. Here is a summary of the key packages we use:

Backend
@aws-sdk/client-dynamodb: AWS SDK for JavaScript, for interacting with Amazon DynamoDB.
axios: Promise based HTTP client for the browser and node.js.
mongoose: MongoDB object modeling tool designed to work in an asynchronous environment.
openai: OpenAI's API client for node.js.
express: Fast, unopinionated, minimalist web framework for Node.js.
Frontend
react: A JavaScript library for building user interfaces.
@emotion/react: A library designed for writing css styles with JavaScript.
axios: Promise based HTTP client for the browser and node.js.
socket.io-client: The client-side library for WebSocket.
👤 Author

Mehyar Swelim

📝 License

This project is ISC licensed.

Show your support

Give a ⭐️ if you like this project!