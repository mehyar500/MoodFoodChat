
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


### Frontend

* [@emotion/react](https://www.npmjs.com/package/@emotion/react): A library designed for writing css styles with JavaScript.
* [@emotion/styled](https://www.npmjs.com/package/@emotion/styled): CSS-in-JS library designed for styling React component systems.
* [@mui/icons-material](https://www.npmjs.com/package/@mui/icons-material): This package provides the Google Material icons packaged as a set of React components.
* [@mui/lab](https://www.npmjs.com/package/@mui/lab): This package hosts the incubator components which are in research and development phase.
* [@mui/material](https://www.npmjs.com/package/@mui/material): React components that implement Google's Material Design.
* [@stripe/react-stripe-js](https://www.npmjs.com/package/@stripe/react-stripe-js): Stripe.js and Elements for React applications.
* [@stripe/stripe-js](https://www.npmjs.com/package/@stripe/stripe-js): The official Stripe.js library.
* [@testing-library/jest-dom](https://www.npmjs.com/package/@testing-library/jest-dom): Custom jest matchers to test the state of the DOM.
* [@testing-library/react](https://www.npmjs.com/package/@testing-library/react): Simple and complete React DOM testing utilities that encourage good testing practices.
* [@testing-library/user-event](https://www.npmjs.com/package/@testing-library/user-event): Simulate user events for react-testing-library.
* [axios](https://www.npmjs.com/package/axios): Promise based HTTP client for the browser and node.js.
* [dotenv](https://www.npmjs.com/package/dotenv): Loads environment variables from .env for nodejs projects.
* [install](https://www.npmjs.com/package/install): Minimal JavaScript module loader.
* [js-cookie](https://www.npmjs.com/package/js-cookie): A simple, lightweight JavaScript API for handling cookies.
* [lodash](https://www.npmjs.com/package/lodash): A modern JavaScript utility library delivering modularity, performance & extras.
* [npm](https://www.npmjs.com/package/npm): Package manager for JavaScript and the world’s largest software registry.
* [public-ip](https://www.npmjs.com/package/public-ip): Get your public IP address.
* [react](https://www.npmjs.com/package/react): A declarative, efficient, and flexible JavaScript library for building user interfaces.
* [react-dom](https://www.npmjs.com/package/react-dom): Serves as the entry point to the DOM and server renderers for React.
* [react-helmet](https://www.npmjs.com/package/react-helmet): A document head manager for React.
* [react-router-dom](https://www.npmjs.com/package/react-router-dom): DOM bindings for React Router.
* [react-scripts](https://www.npmjs.com/package/react-scripts): Scripts and configuration used by Create React App.
* [react-speech-recognition](https://www.npmjs.com/package/react-speech-recognition): A React hook that converts speech from the microphone to text.
* [socket.io-client](https://www.npmjs.com/package/socket.io-client): The client-side library for Socket.IO.
* [web-vitals](https://www.npmjs.com/package/web-vitals): A tiny, modular library for measuring all the Web Vitals metrics on real users, in a way that accurately matches how they're measured by Chrome and reported to other Google tools.


## **👤 Author**

👤 Mehyar Swelim (mehyar500)


## **📝 License**

This project is under the[ ISC](https://opensource.org/licenses/ISC) license.


## **🤝 Show Your Support**

Give a ⭐️ if you like this project!