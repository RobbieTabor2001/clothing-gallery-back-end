const { MongoClient } = require("mongodb");
require('dotenv').config();

// Import the refactored services
const ClothingItemsService = require('./ClothingItem/ClothingItemService');
const ClothingImageService = require('./ClothingImage/ClothingImageService');
const MultiClothingImageService = require('./MultiClothingImage/MultiClothingImageService');

const uri = `mongodb+srv://${process.env.MONGO_ACCESS_USERID}:${process.env.MONGO_ACCESS_ACCESS_KEY}@${process.env.MONGO_CLUSTER_ADDRESS}/${process.env.MONGO_DATABASE_NAME}?retryWrites=true&w=majority&appName=${process.env.MONGO_DATABASE_NAME}`;

class ClothingManagementService {
    constructor() {
        this.client = new MongoClient(uri);
        this.itemsService = new ClothingItemsService();
        this.imageService = new ClothingImageService();
        this.multiImageService = new MultiClothingImageService();
    }

    async connect() {
        try {
            // Connect both services
            await Promise.all([
                this.itemsService.connect(),
                this.imageService.connect(),
                this.multiImageService.connect(),
            ]);
            //console.log("Connected to MongoDB for ClothingManagementService");
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
                this.multiImageService.disconnect(),
            ]);
           //console.log("Disconnected from MongoDB for ClothingManagementService");
        } catch (error) {
           // console.error("Failed to disconnect for ClothingManagementService", error);
            throw error;
        }
    }

    

    

    async deleteItemWithImages(itemId) {
        try {
            
            // Delete the item by ID using ClothingItemsService
            const itemResult = await this.itemsService.deleteItemById(itemId);
            // Delete all images associated with the item using ClothingImageService
            const imagesResult = await this.imageService.deleteImagesByItemId(itemId); // This assumes a method to delete images by itemId is implemented

            const multiImageResult = await this.multiImageService.deleteImagesByItemId(itemId);
           // (`Item and its images deleted successfully for ID: ${itemId}`);
            return { itemResult, imagesResult, multiImageResult };
        } catch (error) {
            console.error(`Error deleting item and its images for ID: ${itemId}:`, error);
            throw error;
        } finally {
            
        }
    }


    async getAllImages() {
        try {
            // Connect to both Image and MultiImage services if not already connected
            await Promise.all([
                this.imageService.connect(),
                this.multiImageService.connect(),
            ]);

            // Use ClothingImageService to get all individual images
            const imageDocs = await this.imageService.findAllImages();
            const images = imageDocs.map(doc => ({
                id: doc._id,
                itemId: doc.itemId,
                imagePath: doc.imagePath,
            }));

            // Use MultiClothingImageService to get all multi images
            const multiImageDocs = await this.multiImageService.getAllMultiImages();
            const multiImages = multiImageDocs.map(doc => ({
                id: doc._id,
                itemIds: doc.itemIds, // Note the plural to differentiate from individual images
                imagePath: doc.imagePath,
            }));

            // Optionally disconnect from both services
            await Promise.all([
                this.imageService.disconnect(),
                this.multiImageService.disconnect(),
            ]);

            // Combine and return the results in an object
            return {
                images, // Collection of individual images
                multiImages // Collection of multi-images
            };
        } catch (error) {
            console.error(`Error retrieving all images and multi images:`, error);
            throw error;
        }
    }
    
    async insertSingleImagesForItem(itemId, imageDetails) {
        try {
            // Ensure itemId is correctly formatted as an ObjectId
            // Prepare the images data with the itemId and image type for each imagePath
            const imagesData = imageDetails.map(({ imagePath }) => ({
                itemId: itemId,
                imagePath,
            }));
    
            // Use ClothingImageService to insert images into MongoDB
            const imagesResult = await this.imageService.bulkInsertImages(imagesData);
            // (`${imagesResult.insertedCount} images were inserted for item with _id: ${itemId}`);
    
            return imagesResult;
        } catch (error) {
            console.error(`Error inserting images for item with ID: ${itemId}:`, error);
            throw error;
        }
    }

    async insertItemDataOnly(itemData) {
        try {
            // Insert item using ClothingItemsService
            const itemResult = await this.itemsService.insertOneItem(itemData);
           // (`A document for item was inserted with the _id: ${itemResult}`);
            return itemResult
        } catch (error) {
          //  console.error("Error inserting item with images:", error);
            throw error;
        }
    }
    
    async insertOneMultiImage(itemIds, imagePath) {
        try {
            // Ensure itemIds are formatted as ObjectId instances
            const formattedItemIds = itemIds;
            // Call the method from MultiClothingImageService to insert the multi-image document
            const result = await this.multiImageService.insertOneMultiImage(formattedItemIds, imagePath);
            //console.log("Inserted one multi-image document:", result);
            return result;
        } catch (error) {
            console.error("Error inserting multi-image document:", error);
            throw error;
        }
    }

    async getAllPaginatedImages(cursorSingle, cursorMulti, limit = 50) {
        try {
            // Fetch paginated individual images
            const paginatedImages = await this.imageService.getPaginatedImages(cursorSingle, limit);

            // Fetch paginated multi-images
            const paginatedMultiImages = await this.multiImageService.getPaginatedMultiImages(cursorMulti, limit);

            // Combine and return the results in an object
            // Note: This simplistic approach returns both sets of images and their cursors separately
            // Adjust based on how you'd like to merge or utilize these results
            return {
                singleImages: {
                    images: paginatedImages.images,
                    nextCursor: paginatedImages.nextCursor,
                    limit: paginatedImages.limit,
                },
                multiImages: {
                    images: paginatedMultiImages.multiImages,
                    nextCursor: paginatedMultiImages.nextCursor,
                    limit: paginatedMultiImages.limit,
                }
            };
        } catch (error) {
            console.error(`Error retrieving paginated images:`, error);
            throw error;
        }
    }
}

module.exports = ClothingManagementService;
