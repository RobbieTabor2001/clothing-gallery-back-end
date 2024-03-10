const express = require('express');
const AWS = require('aws-sdk');
const S3Service = require('../S3/S3Service'); // Adjust path as necessary

const router = express.Router();

// Initialize the S3 client
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Instantiate the S3Service with the S3 client
const s3Service = new S3Service(s3);

// Route to read a folder and get all images
  router.get('/api/s3/folder/:s3FolderName', async (req, res) => {
    const { s3FolderName } = req.params;
    try {
      const images = await s3Service.readFolder(s3FolderName);
      res.json(images);
    } catch (error) {
      console.error('Error reading folder:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Add a route to get an image by its file path
router.get('/api/s3/image/:filePath(*)', async (req, res) => {
  const { filePath } = req.params;
  try {
    // Decode the filePath to ensure spaces and special characters are handled properly
    const decodedFilePath = decodeURIComponent(filePath);

    // Call the getImage method of the S3Service to fetch the image
    const imageData = await s3Service.getImage(decodedFilePath);

    // Assuming imageData is a Buffer, send the image data with the correct content type
    // You might need to adjust the content type based on the actual image type
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.end(imageData, 'binary');
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.get('/api/s3/image-url/:filePath(*)', async (req, res) => {
  const { filePath } = req.params;
  try {
    // Decode the filePath to ensure spaces and special characters are handled properly
    const decodedFilePath = decodeURIComponent(filePath);

    // Call the getImageUrl method of the S3Service to get the image URL
    const imageUrl = await s3Service.getImageUrl(decodedFilePath);

    // Send the image URL back to the client
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error fetching image URL:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports = router;
