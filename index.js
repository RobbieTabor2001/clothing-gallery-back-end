require('dotenv').config();
const express = require('express');
const cors = require('cors');
const clothingGalleryRoutes = require('./Routes/ClothingGalleryRoutes'); // Ensure the path matches your project structure

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); // This will allow all origins. For production, configure appropriately.

// Use the routes defined in ClothingGalleryRoutes
app.use(clothingGalleryRoutes);

// Start the Express server
app.listen(port, () => {
  // console.log(`Server listening at http://localhost:${port}`);
});

