const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();


// Middleware setup
dotenv.config(); 
console.log('PORT:', process.env.PORT); 
app.use(express.json());
app.use(cors()); 

//Routes For API Calls
const userRoute = require('./routes/userRoute');

//Initialize the Route with associated file.
app.use('/api/user', userRoute);


const PORT = process.env.PORT;
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Database connection error: ${error}`);
  });