const { MongoClient } = require("mongodb");
require('dotenv').config();

// Import the refactored services
const ClothingItemsService = require('./ClothingItem/ClothingItemService.js');
const ClothingImageService = require('./ClothingImage/ClothingImageService');

const uri = `mongodb+srv://${process.env.MONGO_ACCESS_USERID}:${process.env.MONGO_ACCESS_ACCESS_KEY}@${process.env.MONGO_CLUSTER_ADDRESS}/${process.env.MONGO_DATABASE_NAME}?retryWrites=true&w=majority&appName=${process.env.MONGO_DATABASE_NAME}`;

class ClothingManagementService {
    constructor() {
        this.client = new MongoClient(uri);
        this.itemsService = new ClothingItemsService();
        this.imageService = new ClothingImageService();
    }

    async connect() {
        try {
            // Connect both services
            await Promise.all([
                this.itemsService.connect(),
                this.imageService.connect(),
            ]);
            /// console.log("Connected to MongoDB for ClothingManagementService");
        } catch (error) {
           // console.error("Failed to connect for ClothingManagementService", error);
            throw error;
        }
    }

    async disconnect() {
        try {
            // Disconnect both services
            await Promise.all([
                this.itemsService.disconnect(),
                this.imageService.disconnect(),
            ]);
           // // console.log("Disconnected from MongoDB for ClothingManagementService");
        } catch (error) {
           // console.error("Failed to disconnect for ClothingManagementService", error);
            throw error;
        }
    }

    async insertItemWithImages(itemData, imagePaths) {
        try {
            // Insert item using ClothingItemsService
            const itemResult = await this.itemsService.insertOneItem(itemData);
    
            // Insert images related to the item using ClothingImageService
            const imagesData = imagePaths.map(imagePath => {
                // Determine the image type based on the first part of the path
                const imageType = imagePath.startsWith("squareimages") ? 1 : 0;
    
                return {
                    itemId: itemResult.insertedId,
                    imagePath: imagePath,
                    imageType, // Add the determined image type
                };
            });
    
            const imagesResult = await this.imageService.bulkInsertImages(imagesData); // This method now needs to handle the imageType field
            // console.log(`${imagesResult.length} images were inserted for item with _id: ${itemResult.insertedId}`);
    
            return itemResult;
        } catch (error) {
            console.error("Error inserting item with images:", error);
            throw error;
        }
    }
    

    async getItemWithImages(itemId) {
        try {
            // Retrieve the item by ID using ClothingItemsService
            const item = await this.itemsService.findItemById(itemId);
            if (!item) {
                // console.log(`No item found with ID: ${itemId}`);
                return null;
            }
            // Retrieve all images for the item using ClothingImageService
            const images = await this.imageService.getImagesForItemById(itemId);
            
            // Process images to include type information in the response
            item.images = images.map(image => ({
                id: image._id,
                itemId: image.itemId,
                imagePath: image.imagePath,
                imageType: image.imageType // Assuming imageType is stored as 0 for Image, 1 for SquareImage
            }));
            
            // console.log(`Item with images retrieved successfully for ID: ${itemId}`);
            return item;
        } catch (error) {
            console.error(`Error retrieving item with images for ID: ${itemId}:`, error);
            throw error;
        }
    }
    

    async deleteItemWithImages(itemId) {
        try {
            
            // Delete the item by ID using ClothingItemsService
            const itemResult = await this.itemsService.deleteItemById(itemId);
            // Delete all images associated with the item using ClothingImageService
            const imagesResult = await this.imageService.deleteImagesByItemId(itemId); // This assumes a method to delete images by itemId is implemented
           // // console.log(`Item and its images deleted successfully for ID: ${itemId}`);
            return { itemResult, imagesResult };
        } catch (error) {
         //   console.error(`Error deleting item and its images for ID: ${itemId}:`, error);
            throw error;
        } finally {
            
        }
    }

    async getAllImages() {
        try {
            
            // Use ClothingImageService to get all images
            const imageDocs = await this.imageService.findAllImages();
            const images = imageDocs.map(doc => ({
                id: doc._id,
                itemId: doc.itemId,
                imagePath: doc.imagePath
            }));
           // // console.log(`Retrieved all images successfully.`);
            return images;
        } catch (error) {
         //   console.error(`Error retrieving all images:`, error);
            throw error;
        } finally {
            
        }
    }

    async insertImagesForItem(itemId, imageDetails) {
        try {
            // Ensure itemId is correctly formatted as an ObjectId
            const objectId = itemId;
    
            // Prepare the images data with the itemId and image type for each imagePath
            const imagesData = imageDetails.map(({ imagePath, imageType }) => ({
                itemId: objectId,
                imagePath,
                imageType, // 0 for Image, 1 for SquareImage
            }));
    
            // Use ClothingImageService to insert images into MongoDB
            const imagesResult = await this.imageService.bulkInsertImages(imagesData);
            /// console.log(`${imagesResult.insertedCount} images were inserted for item with _id: ${itemId}`);
    
            return imagesResult;
        } catch (error) {
            console.error(`Error inserting images for item with ID: ${itemId}:`, error);
            throw error;
        }
    }
    
    async insertImageDetails(itemId, imageDetails) {
        try {
            // Ensure itemId is correctly formatted as an ObjectId
            
    
            // Prepare the images data with the itemId and image type for each imagePath
            const imagesData = imageDetails.map(({ imagePath, imageType }) => ({
                itemId: itemId,
                imagePath,
                imageType, // Includes the image type (0 for Image, 1 for SquareImage)
            }));
    
            // Use ClothingImageService to insert images into MongoDB
            const imagesResult = await this.imageService.bulkInsertImages(imagesData);
            // console.log(`${imagesResult.insertedCount} images were inserted for item with _id: ${itemId}`);
    
            return imagesResult;
        } catch (error) {
            console.error(`Error inserting images for item with ID: ${itemId}:`, error);
            throw error;
        }
    }

    async insertItemOnly(itemData) {
        try {
            // Insert item using ClothingItemsService
            const itemResult = await this.itemsService.insertOneItem(itemData);
           // // console.log(`A document for item was inserted with the _id: ${itemResult}`);
            return itemResult
        } catch (error) {
          //  console.error("Error inserting item with images:", error);
            throw error;
        }
    }

    async getItemWithImagesByType(itemId, imageType) {
        try {
            // Connect to the database if not already connected
            await this.connect();
    
            // Retrieve the item by ID using ClothingItemsService
            const item = await this.itemsService.findItemById(itemId);
            if (!item) {
                // console.log(`No item found with ID: ${itemId}`);
                return null;
            }
    
            // Retrieve images for the item by image type using ClothingImageService
            const images = await this.imageService.getImagesForItemByType(itemId, imageType);
            
            // Append the fetched images to the item object under an appropriate key
            const key = imageType === 1 ? 'squareImages' : 'images'; // Naming the key based on image type
            item[key] = images.map(image => ({
                id: image._id.toString(), // Ensuring the ID is in string format
                itemId: image.itemId.toString(),
                imagePath: image.imagePath,
                imageType: image.imageType,
            }));
    
            // Optionally disconnect from the database
            await this.disconnect();
    
            // console.log(`Item with images of type ${imageType} retrieved successfully for ID: ${itemId}`);
            return item;
        } catch (error) {
            console.error(`Error retrieving item with images of type ${imageType} for ID: ${itemId}:`, error);
            throw error;
        }
    }
    
}

module.exports = ClothingManagementService;
