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
    

    

    async insertOneMultiImage(itemIds, imagePath) {
        try {
            const formattedItemIds = itemIds.map(id => id);
            const document = {
                itemIds: formattedItemIds,
                imagePath: imagePath,
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
            }));
            const result = await this.collection.insertMany(documents);
            // (`Inserted ${result.insertedCount} multi-image documents.`);
            return result;
        } catch (error) {
            console.error("Error bulk inserting multi-image documents:", error);
            throw error;
        }
    }

    async deleteMultiImageByItemId(itemId) {
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

    async getPaginatedMultiImages(cursor, limit = 50) {
        try {
            // Prepare the query with cursor if provided
            let query = {};
            if (cursor) {
                query._id = { $gt: cursor };
            }

            // Execute the find operation with the query, sort by _id ascending, and apply the limit
            const multiImages = await this.collection.find(query).sort({_id: 1}).limit(limit).toArray();

            // Determine the next cursor value if there are more documents to paginate through
            let nextCursor = multiImages.length === limit ? multiImages[multiImages.length - 1]._id.toString() : null;

            return {
                multiImages,
                nextCursor,
                limit,
            };
        } catch (error) {
            console.error("Error in getPaginatedMultiImages:", error);
            throw error;
        }
    }
}

module.exports = MultiClothingImageService;