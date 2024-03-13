
const express = require('express');
const ClothingManagementService = require('../ClothingManagement/ClothingManagementService');

const router = express.Router();
const clothingManagementService = new ClothingManagementService();
// Route to get an item and its images by item ID

router.get('/api/items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const itemWithImages = await clothingManagementService.getItemWithImages(id);
        if (itemWithImages) {
            res.json(itemWithImages);
        } else {
            res.status(404).send('Item not found');
        }
    } catch (error) {
        console.error('Failed to fetch the item with images:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to get all images
router.get('/api/images', async (req, res) => {
    try {
        let images = await clothingManagementService.getAllImages();

        // Shuffle the images array
        images = images.sort(() => Math.random() - 0.5);

        res.json(images);
    } catch (error) {
        console.error('Failed to fetch all images:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
