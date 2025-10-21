const express = require('express');
const mongoose = require('mongoose');
const User = require('./model/user.model.js');
const productRoute = require('./routes/user.route.js');
const app = express();


app.use(express.json());
app.use(express.urlencoded({extended:false}));

// Routes
app.use("/api/users", productRoute);

mongoose
  .connect("mongodb+srv://adminTgp:Passw0rd1@backenddb.j4gd75w.mongodb.net/Node-API?retryWrites=true&w=majority&appName=BackendDB")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Connection failed:", error.message);
  });

  app.listen(3000, ()=> {
    console.log('Server is running port 3000')
})