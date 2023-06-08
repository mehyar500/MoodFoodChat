
# **🍔 MoodFoodChat**

MoodFood is an AI-driven food app powered by GPT4 technology designed to revolutionize your cooking experience.

🔴 Live demo[ here](https://moodfood.app/)

Our powerful features streamline meal planning, inspire culinary creativity, and enhance your dining experience. Discover the future of food with MoodFood and join our growing community.


## **🚀 Getting Started**

This guide will walk you through the steps to set up the project locally.


### **Prerequisites**



* Node.js (version 14 or higher)
* MongoDB
* Git


### **Clone the Repository**

bash

Copy code


```
git clone https://github.com/<username>/moodfood.git
```



### **Setup Backend**



1. Navigate to the `api` folder and create a `.env` file by copying the `.env.example` file:

bash

Copy code


```
cd moodfood/api
cp .env.example .env

```



1. Open the `.env` file and replace the values with your own:

makefile

Copy code


```
MONGODB_URI=<your-mongodb-uri>
FRONTEND_BASE_URL=http://localhost:3000
BACKEND_BASE_URL=http://localhost:3030
COOKIE_KEY=<your-cookie-key>
OPENAI_API_KEY=<your-openai-api-key>

```



1. Install the dependencies and start the server:

bash

Copy code


```
npm install
npm start
```


The server will start on port 3030.


### **Setup Frontend**



1. Open a new terminal window and navigate to the `app` folder:

bash

Copy code


```
cd ../app

```



1. Create a `.env` file by copying the `.env.example` file:

bash

Copy code


```
cp .env.example .env

```



1. Open the `.env` file and replace the values with your own:

bash

Copy code


```
REACT_APP_API_BASE_URL=http://localhost:3030/api

```



1. Install the dependencies and start the application:

bash

Copy code


```
npm install
npm start
```


The application will start on port 3000. Open your web browser and navigate to `http://localhost:3000` to view the application.


## **📦 Packages**

Our application uses a number of packages to work properly. Here's a list of some key packages we use:


### **Backend**



* [@aws-sdk/client-dynamodb](https://www.npmjs.com/package/@aws-sdk/client-dynamodb): AWS SDK for JavaScript, for interacting with Amazon DynamoDB.
* [axios](https://www.npmjs.com/package/axios): Promise based HTTP client for the browser and node.js.
* [mongoose](https://www.npmjs.com/package/mongoose): MongoDB object modeling tool designed to work in an asynchronous environment.
* [openai](https://www.npmjs.com/package/openai): OpenAI's API client for node.js.
* [express](https://www.npmjs.com/package/express): Fast, unopinionated, minimalist web framework for Node.js.


### **Frontend**



* [react](https://www.npmjs.com/package/react): A JavaScript library for building user interfaces.
* [@emotion/react](https://www.npmjs.com/package/@emotion/react): A library designed for writing css styles with JavaScript.
* [axios](https://www.npmjs.com/package/axios): Promise based HTTP client for the browser and node.js.
* [socket.io-client](https://www.npmjs.com/package/socket.io-client): The client-side library for WebSocket.


## **👤 Author**

👤 Mehyar Swelim (mehyar500)


## **📝 License**

This project is under the[ ISC](https://opensource.org/licenses/ISC) license.


## **🤝 Show Your Support**

Give a ⭐️ if you like this project!