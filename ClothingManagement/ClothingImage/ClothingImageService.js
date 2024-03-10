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
            console.log("Connected to MongoDB for ClothingImageService");
            this.db = this.client.db(process.env.MONGO_DATABASE_NAME);
            this.collection = this.db.collection("clothingImage");
        } catch (error) {
            console.error("Failed to connect to MongoDB for ClothingImageService", error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.client.close();
            console.log("Disconnected from MongoDB for ClothingImageService");
        } catch (error) {
            console.error("Failed to disconnect from MongoDB for ClothingImageService", error);
            throw error;
        }
    }

    async findAllImages() {
        try {
            const images = await this.collection.find({}).toArray();
            console.log("Fetched all images");
            return images;
        } catch (error) {
            console.error("Error fetching all images:", error);
            throw error;
        }
    }

    async findImageById(id) {
        try {
            const image = await this.collection.findOne({ _id: new ObjectId(id) });
            if (image) {
                console.log("Fetched image by ID:", id);
                return image;
            } else {
                console.log("No image found with ID:", id);
                return null;
            }
        } catch (error) {
            console.error("Error fetching image by ID:", error);
            throw error;
        }
    }

    async deleteImageById(id) {
        try {
            const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount === 1) {
                console.log("Successfully deleted one image.");
            } else {
                console.log("No images matched the query. Deleted 0 images.");
            }
            return result;
        } catch (error) {
            console.error("Error deleting image by ID:", error);
            throw error;
        }
    }

    async updateImageById(id, updateDoc) {
        try {
            const result = await this.collection.updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });
            if (result.matchedCount === 1) {
                console.log(`Document with ID ${id} updated.`);
            } else {
                console.log(`No documents matched the query for ID ${id}. Update operation was not performed.`);
            }
            return result;
        } catch (error) {
            console.error("Error updating image by ID:", error);
            throw error;
        }
    }

    async bulkInsertItemsWithImagesFromCSV(csvFilePath) {
        try {
            await this.connect(); // Ensure connection is established
            
            const csvData = fs.readFileSync(csvFilePath);
            const records = csvParse(csvData, {
                columns: true,
                skip_empty_lines: true
            });

            for (const record of records) {
                const { 'Item Name': name, 'File Paths': filePaths, Description: description } = record;
                const imagePaths = filePaths.split(';');
                
                // Insert item without imagePaths
                const itemResult = await this.itemsCollection.insertOne({ name, description });
                console.log(`Inserted item: ${name} with ID: ${itemResult.insertedId}`);
                
                // Prepare and insert image documents for this item
                const imageDocuments = imagePaths.map(path => ({
                    itemId: itemResult.insertedId,
                    imagePath: path
                }));

                if (imageDocuments.length > 0) {
                    const imagesResult = await this.imagesCollection.insertMany(imageDocuments);
                    console.log(`Inserted ${imagesResult.insertedCount} images for item: ${name}`);
                } else {
                    console.log(`No images to insert for item: ${name}`);
                }
            }

            console.log("Completed bulk insert of items and images from CSV.");
        } catch (error) {
            console.error("Error during bulk insert from CSV:", error);
            throw error;
        } finally {
            await this.disconnect(); // Clean up connection
        }
    }

    // Additional methods like insert, delete, or update can be added here following a similar pattern
}

module.exports = ClothingImageService;
