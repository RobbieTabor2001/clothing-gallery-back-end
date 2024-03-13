// Remove the duplicated AWS import and add missing app declaration
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const express = require('express');
const CombinedClothingService = require('../EndpointService/CombinedClothingService'); // Adjust the path as necessary
const bodyParser = require('body-parser');

const router = express.Router(); // Use express.Router() to create a new router instance
const combinedClothingService = new CombinedClothingService();

// Use bodyParser middleware to parse JSON bodies
router.use(bodyParser.json());

// Define your routes on the router, not app
router.get('/api/images', async (req, res) => {
    try {
        const urls = await combinedClothingService.getAllImageURLs();
        res.status(200).json(urls);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving all image URLs.");
    }
});

router.get('/api/items/:itemId', async (req, res) => {
    const { itemId } = req.params;
    try {
        const itemWithUrls = await combinedClothingService.getItemWithImageUrls(itemId);
        if (!itemWithUrls) {
            return res.status(404).send("Item not found.");
        }
        res.status(200).json(itemWithUrls);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving item with image URLs.");
    }
});

module.exports = router; // Export the router
