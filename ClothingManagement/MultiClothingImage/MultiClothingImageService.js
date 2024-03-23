const { MongoClient, ObjectId } = require("mongodb");
require('dotenv').config();

const uri = `mongodb+srv://${process.env.MONGO_ACCESS_USERID}:${process.env.MONGO_ACCESS_ACCESS_KEY}@${process.env.MONGO_CLUSTER_ADDRESS}/${process.env.MONGO_DATABASE_NAME}?retryWrites=true&w=majority&appName=${process.env.MONGO_DATABASE_NAME}`;

class MultiClothingImageService {
    constructor() {
        this.client = new MongoClient(uri);
        this.db = null;
        this.collection = null;
    }

    async connect() {
        try {
            await this.client.connect();
            this.db = this.client.db(process.env.MONGO_DATABASE_NAME);
            // Assuming the collection for multi-images has a different name, for example, 'multiClothingImage'
            this.collection = this.db.collection("multiClothingImage");
        } catch (error) {
            console.error("Failed to connect to MongoDB for MultiClothingImageService", error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.client.close();
        } catch (error) {
            console.error("Failed to disconnect from MongoDB for MultiClothingImageService", error);
            throw error;
        }
    }

    async getAllMultiImages() {
        try {
            const images = await this.collection.find({}).toArray();
            return images;
        } catch (error) {
            console.error("Error fetching all multi images:", error);
            throw error;
        }
    }

    async getMultiImageById(imageId) {
        try {
            const image = await this.collection.findOne({ _id:  imageId });
            return image;
        } catch (error) {
            console.error("Error fetching multi image by ID:", error);
            throw error;
        }
    }

    async deleteMultiImageById(imageId) {
        try {
            const result = await this.collection.deleteOne({ _id:  imageId });
            return result;
        } catch (error) {
            console.error("Error deleting multi image by ID:", error);
            throw error;
        }
    }
    
    async getMultiImagesByType(imageType) {
        try {
            // Validate imageType parameter to ensure it's within expected range/values
            if (![0, 1].includes(imageType)) {
                throw new Error("Invalid image type specified. Expected 0 for square or 1 for non-square.");
            }
    
            const images = await this.collection.find({ imageType: imageType }).toArray();
            if (images.length > 0) {
                // (`Fetched ${images.length} multi-image document(s) of type ${imageType}.`);
            } else {
                // (`No multi-image documents found of type ${imageType}.`);
            }
            return images;
        } catch (error) {
            console.error(`Error fetching multi-image documents of type ${imageType}:`, error);
            throw error;
        }
    }
    

    async insertOneMultiImage(itemIds, imagePath, imageType) {
        try {
            const formattedItemIds = itemIds.map(id => id);
            const document = {
                itemIds: formattedItemIds,
                imagePath: imagePath,
                // Add imageType to the document
                imageType: imageType // Assuming imageType is passed as a parameter (0 for square, 1 for non-square)
            };
            const result = await this.collection.insertOne(document);
            //console.log("Inserted one multi-image document:", result);
            return result;
        } catch (error) {
            console.error("Error inserting one multi-image document:", error);
            throw error;
        }
    }

    async bulkInsertMultiImages(multiImages) {
        try {
            const documents = multiImages.map(img => ({
                itemIds: img.itemIds.map(id => id),
                imagePath: img.imagePath,
                imageType: img.imageType // Assuming each img object includes an imageType property
            }));
            const result = await this.collection.insertMany(documents);
            // (`Inserted ${result.insertedCount} multi-image documents.`);
            return result;
        } catch (error) {
            console.error("Error bulk inserting multi-image documents:", error);
            throw error;
        }
    }

    async deleteByItemId(itemId) {
        try {
            const itemObjectId = itemId;
            const result = await this.collection.deleteMany({
                itemIds: { $in: [itemObjectId] }
            });
            if (result.deletedCount > 0) {
                // (`Deleted ${result.deletedCount} multi-image document(s) containing item ID: ${itemId}`);
            } else {
                // (`No multi-image documents found containing item ID: ${itemId}. No documents deleted.`);
            }
            return result;
        } catch (error) {
            console.error(`Error deleting multi-image documents containing item ID: ${itemId}:`, error);
            throw error;
        }
    }
}

module.exports = MultiClothingImageService;