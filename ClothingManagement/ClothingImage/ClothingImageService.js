const { MongoClient, ObjectId } = require("mongodb");
require('dotenv').config();


// Construct the MongoDB URI using environment variables
const uri = `mongodb+srv://${process.env.MONGO_ACCESS_USERID}:${process.env.MONGO_ACCESS_ACCESS_KEY}@${process.env.MONGO_CLUSTER_ADDRESS}/${process.env.MONGO_DATABASE_NAME}?retryWrites=true&w=majority&appName=${process.env.MONGO_DATABASE_NAME}`;

class ClothingImageService {
    constructor() {
        this.client = new MongoClient(uri);
        this.db = null;
        this.collection = null;
    }

    async connect() {
        try {
            await this.client.connect();
         //console.log("Connected to MongoDB for ClothingImageService");
            this.db = this.client.db(process.env.MONGO_DATABASE_NAME);
            this.collection = this.db.collection("clothingImage");
        } catch (error) {
          //  console.error("Failed to connect to MongoDB for ClothingImageService", error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.client.close();
           //console.log("Disconnected from MongoDB for ClothingImageService");
        } catch (error) {
           // console.error("Failed to disconnect from MongoDB for ClothingImageService", error);
            throw error;
        }
    }

    async findAllImages() {
        try {
            const images = await this.collection.find({}).toArray();
           //console.log("Fetched all images");
            return images;
        } catch (error) {
            console.error("Error fetching all images:", error);
            throw error;
        }
    }

    async findImageById(id) {
        try {
            const image = await this.collection.findOne({ _id: id });
            if (image) {
            //console.log("Fetched image by ID:", id);
                return image;
            } else {
              //console.log("No image found with ID:", id);
                return null;
            }
        } catch (error) {
          //  console.error("Error fetching image by ID:", error);
            throw error;
        }
    }

    async deleteImageById(id) {
        try {
            const result = await this.collection.deleteOne({ _id: id });
            if (result.deletedCount === 1) {
              //console.log("Successfully deleted one image.");
            } else {
             //console.log("No images matched the query. Deleted 0 images.");
            }
            return result;
        } catch (error) {
           // console.error("Error deleting image by ID:", error);
            throw error;
        }
    }

    async updateImageById(id, updateDoc) {
        try {
            const result = await this.collection.updateOne({ _id:  id }, { $set: updateDoc });
            if (result.matchedCount === 1) {
               // (`Document with ID ${id} updated.`);
            } else {
               // (`No documents matched the query for ID ${id}. Update operation was not performed.`);
            }
            return result;
        } catch (error) {
            //console.error("Error updating image by ID:", error);
            throw error;
        }
    }

    async getImagesForItemById(itemId) {
        try {
            // Ensure itemId is an ObjectId
            const itemObjectId = itemId;

            // Find images that have the specified itemId
            const images = await this.collection.find({ itemId: itemObjectId }).toArray();

            if (images.length > 0) {
             // (`Fetched ${images.length} image(s) for item with ID: ${itemId}`);
                return images; // Returns an array of image documents
            } else {
             // (`No images found for item with ID: ${itemId}`);
                return []; // Returns an empty array if no images are found
            }
        } catch (error) {
           // console.error(`Error fetching images for item with ID: ${itemId}:`, error);
            throw error;
        }
    }

    async deleteImagesByItemId(itemId) {
        try {
            const result = await this.collection.deleteMany({ itemId: itemId });
           // (`${result.deletedCount} image(s) deleted for item with ID: ${itemId}`);
            return result;
        } catch (error) {
          //  console.error(`Error deleting images for item with ID: ${itemId}:`, error);
            throw error;
        }
    }

    async bulkInsertImages(imagesData) {
        try {
            // Ensure that all itemId values are correctly formatted as ObjectId instances

            const formattedImagesData = imagesData.map(data => ({
                ...data,
                itemId: data.itemId
            }));
    
            const result = await this.collection.insertMany(formattedImagesData);
            // (`${result.insertedCount} images were inserted.`);
            return result;
        } catch (error) {
            console.error("Error bulk inserting images:", error);
            throw error;
        }
    }

    async getImagesForItemByType(itemId) {
        try {
            const itemObjectId =  itemId;
            const images = await this.collection.find({ itemId: itemObjectId}).toArray();
            if (images.length > 0) {
                return images;
            } else {
                return [];
            }
        } catch (error) {
            console.error(`Error fetching images for item with ID: ${itemId}:`, error);
            throw error;
        }
    }
    
    async getPaginatedImages(cursor, limit = 50) {
        try {
            // Prepare the query with cursor if provided
            const query = cursor ? { _id: { $gt: new ObjectId(cursor) } } : {};

            console.log(query);
            // Execute the find operation with the query, sort by _id ascending, and apply the limit
            const images = await this.collection.find(query).sort({ _id: 1 }).limit(limit).toArray();

            // Determine the next cursor value if there are more documents to paginate through
            const nextCursor = images.length === limit ? images[images.length - 1]._id.toString() : null;
    
            return {
                images,
                nextCursor,
                limit,
            };
        } catch (error) {
            console.error("Error in getPaginatedImages:", error);
            throw error;
        }
    }
    
    

}

module.exports = ClothingImageService;
