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

router.get('/api/paginated-images', async (req, res) => {
    // Retrieve single and multi-image cursors and limit from query parameters; default limit to 50 if not provided
    const { cursorSingle, cursorMulti } = req.query;
    const limit = parseInt(req.query.limit, 10) || 25;

    try {
        // Fetch paginated image URLs from the service, passing both cursors and the single limit
        // This method now expects the getAllPaginatedImageURLs method to handle pagination for both image types
        const paginatedResult = await combinedClothingService.getAllPaginatedImageURLs(cursorSingle, cursorMulti, limit);

        res.status(200).json(paginatedResult);
    } catch (error) {
        console.error("Error retrieving paginated images:", error);
        res.status(500).send("Error retrieving paginated images.");
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
