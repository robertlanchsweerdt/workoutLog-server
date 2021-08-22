require('dotenv').config();
const express = require('express');
const dbConnection = require('./db');

// server gets created
const app = express();

// import controllers
const controllers = require('./controllers');

// mount json to parse during POST and PUT requests
app.use(express.json());

// mount user controller
app.use('/user', controllers.userController);

// mount log controller
app.use('/log', controllers.logController);

// test connection to server and define models to database
dbConnection
  .authenticate()
  .then(() => dbConnection.sync())
  .then(() => {
    // server is mounted
    app.listen(process.env.PORT, () => {
      console.log(`[SERVER]: App is listening on ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error(`[SERVER]: Server crashed due to ${err}`));
