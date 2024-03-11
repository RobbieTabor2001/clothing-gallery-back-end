const { MongoClient, ObjectId } = require("mongodb");
require('dotenv').config();

const uri = `mongodb+srv://${process.env.MONGO_ACCESS_USERID}:${process.env.MONGO_ACCESS_ACCESS_KEY}@${process.env.MONGO_CLUSTER_ADDRESS}/${process.env.MONGO_DATABASE_NAME}?retryWrites=true&w=majority&appName=${process.env.MONGO_DATABASE_NAME}`;
class ClothingManagementService {
    constructor() {
        this.client = new MongoClient(uri);
        this.db = null;
        this.itemsCollection = null;
        this.imagesCollection = null;
    }

    async connect() {
        try {
            await this.client.connect();
            console.log("Connected to MongoDB for ClothingManagementService");
            this.db = this.client.db(process.env.MONGO_DATABASE_NAME);
            this.itemsCollection = this.db.collection("clothingItem");
            this.imagesCollection = this.db.collection("clothingImage");
        } catch (error) {
            console.error("Failed to connect to MongoDB for ClothingManagementService", error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.client.close();
            console.log("Disconnected from MongoDB for ClothingManagementService");
        } catch (error) {
            console.error("Failed to disconnect from MongoDB for ClothingManagementService", error);
            throw error;
        }
    }

    // Example method to insert an item and its images
    async insertItemWithImages(itemData, imagePaths) {
        try {
            // Insert item
            const itemResult = await this.itemsCollection.insertOne(itemData);
            console.log(`A document for item was inserted with the _id: ${itemResult.insertedId}`);

            // Insert images related to the item
            const imagesData = imagePaths.map(path => ({
                itemId: itemResult.insertedId,
                imagePath: path
            }));
            const imagesResult = await this.imagesCollection.insertMany(imagesData);
            console.log(`${imagesResult.insertedCount} images were inserted for item with _id: ${itemResult.insertedId}`);

            return { itemResult, imagesResult };
        } catch (error) {
            console.error("Error inserting item with images:", error);
            throw error;
        }
    }

    // Example method to delete an item and its related images
    async deleteItemAndImages(itemId) {
        try {
            // Delete item
            const itemResult = await this.itemsCollection.deleteOne({ _id: new ObjectId(itemId) });
            console.log(itemResult.deletedCount === 1 ? "Successfully deleted one item." : "No items matched the query. Deleted 0 items.");

            // Delete related images
            const imagesResult = await this.imagesCollection.deleteMany({ itemId: new ObjectId(itemId) });
            console.log(`${imagesResult.deletedCount} images were deleted for item with _id: ${itemId}`);

            return { itemResult, imagesResult };
        } catch (error) {
            console.error("Error deleting item and its images:", error);
            throw error;
        }
    }

    async getItemWithImages(itemId) {
        try {
            await this.connect(); // Ensure connection is established
            
            const item = await this.itemsCollection.findOne({ _id: new ObjectId(itemId) });
            if (!item) {
                console.log("No item found with ID:", itemId);
                return null; // Or handle as appropriate for your application
            }
    
            const images = await this.imagesCollection.find({ itemId: new ObjectId(itemId) }).toArray();
            console.log(`Fetched ${images.length} images for item with ID: ${itemId}`);
            
            const itemWithImages = {
                ...item,
                images: images.map(image => image.imagePath) // Assuming you want to return just the image paths
            };
    
            return itemWithImages;
        } catch (error) {
            console.error("Error getting item with images:", error);
            throw error;
        } finally {
            await this.disconnect(); // Clean up connection
        }
    }
    async getAllImages() {
        try {
            await this.connect(); // Ensure connection is established
            const images = await this.imagesCollection.find({}).toArray();
            console.log("Fetched all images");
            return images;

        } catch (error) {
            console.error("Error getting item with images:", error);
            throw error;
        } finally {
            await this.disconnect(); // Clean up connection
        }
    }
}

module.exports = ClothingManagementService;
