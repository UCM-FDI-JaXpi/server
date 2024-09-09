# JaXpi Server Deployment Guide

This guide provides instructions on how to deploy the server as a developer, generate the database using the JavaScript files in the `test` directory, and configure the environment variables found in the `.env` file.
The server is designed to work in conjunction with [JaXpi Lib](https://github.com/UCM-FDI-JaXpi/lib/), a library for sending data in xAPI format, and [JaXpi Analysis](https://github.com/UCM-FDI-JaXpi/analysis/), a frontend for analyzing those data. Together, these components form a comprehensive ecosystem for data handling and analysis.

## Prerequisites

Before you begin, ensure you have Node.js and npm installed on your system. You will also need MongoDB running locally or have access to a MongoDB instance.

## Deployment as a Developer

To deploy the server in a development environment, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the root directory of the project.
3. Install the project dependencies by running:
```sh
npm install
```
4. Start the server in development mode by running:
```sh
npm run devStart
```

## Generating the Database
The project includes scripts to set up the database with initial data for testing and development purposes.

To create an admin user, run:
```sh
npm run dbSetAdmin
```

This script uses the create_admin.js file in the test directory to create an admin user with a predefined password.

To create additional users, run:

```sh
npm run dbCreate
```

This script uses the create_users.js file in the test directory to populate the database with sample users.

Configuring Environment Variables
The project uses a .env file to manage environment variables. You must create this file in the root directory of the project and define the following variables:

* DATABASE_URL: The connection string to your MongoDB instance.
* SESSION_SECRET: A secret key for securing sessions.
* PORT: The port number on which the server will listen.
* FRONT_PORT: The port number for the frontend application (if applicable).
* GAME_PORT: The port number for the game server (if applicable).

Example .env file:

```sh
DATABASE_URL=mongodb://localhost:27017/mydatabase
SESSION_SECRET=mysecretkey
PORT=3000
FRONT_PORT=8080
GAME_PORT=8081
```

## Production Environment
In a production environment, the definition of these environment variables may differ. Typically, environment variables in production are set through the hosting platform's configuration tools rather than a .env file. Ensure that all necessary environment variables are properly configured in your production environment.

## Conclusion
Following these steps, you should be able to deploy the server for development, set up the database, and configure the necessary environment variables. For production deployment, remember to adjust the environment variable definitions according to your hosting platform's requirements.
