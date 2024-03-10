require('dotenv').config();
const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
// This will allow all origins. For production, configure appropriately.


// Import route handlers
const s3Routes = require('./Routes/S3Routes.js'); // Adjust the path to where your s3Routes file is located
const clothingItemRoutes = require('./Routes/ClothingItemRoutes.js'); // Adjust the path as necessary

const app = express();
const port = process.env.PORT || 4000; // Default to 3000 if PORT env var not set

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); 
// Use the defined routes
app.use(s3Routes);
app.use(clothingItemRoutes)

// Start the Express server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
