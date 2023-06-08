
# **🍔 MoodFoodChat**

MoodFood is an AI-driven food app powered by GPT4 technology designed to revolutionize your cooking experience.

![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg) 
![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)

🔴 Live demo[ here](https://moodfood.app/)

Our powerful features streamline meal planning, inspire culinary creativity, and enhance your dining experience. Discover the future of food with MoodFood and join our growing community.


## **🚀 Getting Started**
This guide will walk you through the steps to set up the project locally.


### **Prerequisites**
* Node.js (version 14 or higher)
* MongoDB
* Git


### **Clone the Repository**
```
git clone https://github.com/<username>/moodfood.git
```



### **Setup Backend**
1. Navigate to the `api` folder and create a `.env` file by copying the `.env.example` file:

```
cd moodfood/api
cp .env.example .env

```



1. Open the `.env` file and replace the values with your own:

```
MONGODB_URI=<your-mongodb-uri>
FRONTEND_BASE_URL=http://localhost:3000
BACKEND_BASE_URL=http://localhost:3030
COOKIE_KEY=<your-cookie-key>
OPENAI_API_KEY=<your-openai-api-key>

```


1. Install the dependencies and start the server:

```
npm install
npm start
```


The server will start on port 3030.


### **Setup Frontend**
1. Open a new terminal window and navigate to the `app` folder:

```
cd ../app

```



1. Create a `.env` file by copying the `.env.example` file:


```
cp .env.example .env

```



1. Open the `.env` file and replace the values with your own:

```
REACT_APP_API_BASE_URL=http://localhost:3030/api

```



1. Install the dependencies and start the application:

```
npm install
npm start
```


The application will start on port 3000. Open your web browser and navigate to `http://localhost:3000` to view the application.


## **📦 Packages**

Our application uses a number of packages to work properly. Here's a list of some key packages we use:


### **Backend**

### Backend

* [@aws-sdk/client-dynamodb](https://www.npmjs.com/package/@aws-sdk/client-dynamodb): AWS SDK for JavaScript, for interacting with Amazon DynamoDB.
* [@mailchimp/mailchimp_transactional](https://www.npmjs.com/package/@mailchimp/mailchimp_transactional): The official Mailchimp transactional (formerly Mandrill) module.
* [aws-sdk](https://www.npmjs.com/package/aws-sdk): AWS SDK for JavaScript in the browser and Node.js.
* [axios](https://www.npmjs.com/package/axios): Promise-based HTTP client for the browser and node.js.
* [axios-rate-limit](https://www.npmjs.com/package/axios-rate-limit): Apply a simple rate limit to axios requests.
* [body-parser](https://www.npmjs.com/package/body-parser): Node.js body parsing middleware.
* [body-parser-rawbody](https://www.npmjs.com/package/body-parser-rawbody): Middleware for express that stores the raw body before it gets parsed.
* [busboy](https://www.npmjs.com/package/busboy): A streaming parser for HTML form data for node.js.
* [cheerio](https://www.npmjs.com/package/cheerio): Implementation of core jQuery designed specifically for the server.
* [connect-mongo](https://www.npmjs.com/package/connect-mongo): MongoDB session store for Express and Connect.
* [cookie-parser](https://www.npmjs.com/package/cookie-parser): Cookie parsing with signatures.
* [cookie-session](https://www.npmjs.com/package/cookie-session): Simple cookie-based session middleware.
* [cors](https://www.npmjs.com/package/cors): Middleware for enabling CORS (Cross-Origin Resource Sharing).
* [dd-trace](https://www.npmjs.com/package/dd-trace): Datadog APM tracing client for Node.js.
* [dotenv](https://www.npmjs.com/package/dotenv): Loads environment variables from .env file.
* [express](https://www.npmjs.com/package/express): Fast, unopinionated, minimalist web framework for Node.js.
* [express-session](https://www.npmjs.com/package/express-session): Session middleware for Express.
* [googleapis](https://www.npmjs.com/package/googleapis): Google's officially supported node.js client library for using Google APIs, with support for authorization and authentication.
* [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken): An implementation of JSON Web Tokens.
* [langchain](https://www.npmjs.com/package/langchain): Unofficial LangChain client for Node.js.
* [mongoose](https://www.npmjs.com/package/mongoose): MongoDB object modeling tool designed to work in an asynchronous environment.
* [multer](https://www.npmjs.com/package/multer): Middleware for handling `multipart/form-data`, primarily used for file upload.
* [multer-s3](https://www.npmjs.com/package/multer-s3): Amazon S3 storage engine for multer.
* [node-cron](https://www.npmjs.com/package/node-cron): Tool that allows you to execute something on a schedule.
* [node-mailjet](https://www.npmjs.com/package/node-mailjet): Mailjet API client for Node.js.
* [nodemon](https://www.npmjs.com/package/nodemon): Simple monitor script for use during development of a node.js app.
* [openai](https://www.npmjs.com/package/openai): OpenAI's API client for node.js.
* [pg](https://www.npmjs.com/package/pg): Non-blocking PostgreSQL client for Node.js.
* [pg-hstore](https://www.npmjs.com/package/pg-hstore): A node package for serializing and deserializing JSON data to hstore format.
* [socket.io](https://www.npmjs.com/package/socket.io): Node.js realtime framework server.
* [stripe](https://www.npmjs.com/package/stripe): Stripe official library for Node.js.
* [tiktoken](https://www.npmjs.com/package/tiktoken): A library to see how many tokens are in a text string without making an API call.
* [util](https://www.npmjs.com/package/util): Node.js util module.
* [winston](https://www.npmjs.com/package/winston): A logger for just about everything.


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